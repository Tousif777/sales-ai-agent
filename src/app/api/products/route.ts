import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET — List all products for the authenticated user
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const products = await db.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

// POST — Create a single product
export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json()
  const { name, description, price, currency, sku, stock, inStock, attributes } = body

  if (!name || price === undefined) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
  }

  const stockNum = stock ? parseInt(stock) : 0

  const product = await db.product.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      price: parseFloat(price),
      currency: currency || "USD",
      sku: sku || null,
      stock: stockNum,
      inStock: stockNum > 0 ? true : inStock !== false,
      attributes: attributes || {},
    },
  })

  return NextResponse.json(product, { status: 201 })
}
