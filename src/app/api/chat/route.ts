import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET — List all prospects with chat data
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json([], { status: 200 })

  const prospects = await db.prospect.findMany({
    where: { userId: user.id },
    include: {
      chatLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { chatLogs: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const withChats = prospects.filter((p: any) => p._count.chatLogs > 0)

  return NextResponse.json(withChats)
}
