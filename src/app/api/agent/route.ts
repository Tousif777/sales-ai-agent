import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// GET — Fetch the agent config for the current user
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkUserId: clerkId.trim()},
    include: { aiAgent: true },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(user.aiAgent || { systemPrompt: "", name: "Agent" })
}

// PUT — Update the agent system prompt
export async function PUT(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { systemPrompt, name } = await req.json()

  const agent = await db.aIAgent.upsert({
    where: { userId: user.id },
    update: {
      systemPrompt: systemPrompt || "",
      ...(name && { name }),
    },
    create: {
      userId: user.id,
      systemPrompt: systemPrompt || "",
      name: name || "Agent",
    },
  })

  return NextResponse.json(agent)
}
