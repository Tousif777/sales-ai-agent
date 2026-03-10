import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// PUT — Update a product
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { id } = await props.params
  const body = await req.json()

  const product = await db.product.updateMany({
    where: { id, userId: user.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
      ...(body.inStock !== undefined && { inStock: body.inStock }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.attributes !== undefined && { attributes: body.attributes }),
    },
  })

  if (product.count === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// DELETE — Delete a product
export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { id } = await props.params

  const result = await db.product.deleteMany({
    where: { id, userId: user.id },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
