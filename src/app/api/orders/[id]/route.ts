import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// PUT — Update order status (with stock management)
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { id } = await props.params
  const { status } = await req.json()

  const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Fetch the order with its current status and items
  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Reduce stock when confirming an order
  if (status === "CONFIRMED" && order.status === "PENDING") {
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
      // Auto mark out of stock if needed
      const updated = await db.product.findUnique({ where: { id: item.productId } })
      if (updated && updated.stock <= 0) {
        await db.product.update({
          where: { id: item.productId },
          data: { inStock: false },
        })
      }
    }
  }

  // Restore stock when canceling a confirmed/completed order
  if (status === "CANCELED" && (order.status === "CONFIRMED" || order.status === "COMPLETED")) {
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          inStock: true,
        },
      })
    }
  }

  // Update the order status
  await db.order.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true })
}

// DELETE — Delete an order
export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { id } = await props.params

  const result = await db.order.deleteMany({
    where: { id, userId: user.id },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
