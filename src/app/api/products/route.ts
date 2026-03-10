import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET — List products for the authenticated user with pagination
export async function GET(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const skip = (page - 1) * limit

  const where = {
    userId: user.id,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ]
    } : {})
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({
      where,
    }),
  ])

  return NextResponse.json({
    products,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    }
  })
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
