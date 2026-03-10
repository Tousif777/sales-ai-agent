import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { OrderStatus } from "@prisma/client"

// GET — List orders for the authenticated user with pagination and search
export async function GET(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || "ALL"
  const skip = (page - 1) * limit

  const where = {
    userId: user.id,
    ...(status !== "ALL" ? { status: status as OrderStatus } : {}),
    ...(search ? {
      OR: [
        { prospect: { name: { contains: search, mode: "insensitive" as const } } },
        { items: { some: { product: { name: { contains: search, mode: "insensitive" as const } } } } },
        { notes: { contains: search, mode: "insensitive" as const } },
      ]
    } : {})
  }

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        prospect: { select: { name: true, contact: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({
      where,
    }),
  ])

  return NextResponse.json({
    orders,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    }
  })
}
