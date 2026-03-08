import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// POST — CSV import: accepts raw CSV text, parses and bulk-creates products
export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((l) => l.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 })
    }

    // Parse header to find column indexes
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const nameIdx = header.indexOf("name")
    const priceIdx = header.indexOf("price")
    const descIdx = header.indexOf("description")
    const skuIdx = header.indexOf("sku")
    const currencyIdx = header.indexOf("currency")

    if (nameIdx === -1 || priceIdx === -1) {
      return NextResponse.json({ error: "CSV must have 'name' and 'price' columns" }, { status: 400 })
    }

    const products: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim())
      const name = cols[nameIdx]
      const price = parseFloat(cols[priceIdx])

      if (!name || isNaN(price)) continue

      products.push({
        userId: user.id,
        name,
        price,
        description: descIdx !== -1 ? cols[descIdx] || null : null,
        sku: skuIdx !== -1 ? cols[skuIdx] || null : null,
        currency: currencyIdx !== -1 ? cols[currencyIdx] || "USD" : "USD",
      })
    }

    if (products.length === 0) {
      return NextResponse.json({ error: "No valid products found in CSV" }, { status: 400 })
    }

    const result = await db.product.createMany({ data: products })

    return NextResponse.json({ imported: result.count }, { status: 201 })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 })
  }
}
