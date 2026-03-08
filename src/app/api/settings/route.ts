import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET() {
  const { userId: clerkId } = await auth()
  console.log("[DEBUG] Settings API Hit with clerkId:", clerkId);
  
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cleanUserId = clerkId.trim();

  const user = await db.user.findUnique({
    where: { clerkUserId: cleanUserId },
    select: {
      email: true,
      plan: true,
      messageCount: true,
    }
  })

  console.log("[DEBUG] Settings API DB result:", !!user);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Define limits based on plan
  let messageLimit = 100
  if (user.plan === "PRO") messageLimit = 2000

  return NextResponse.json({
    email: user.email,
    plan: user.plan,
    messageCount: user.messageCount,
    messageLimit: messageLimit,
  })
}
