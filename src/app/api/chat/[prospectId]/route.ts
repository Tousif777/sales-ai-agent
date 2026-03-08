import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// DELETE — Delete a prospect and all their chat logs
export async function DELETE(
  _req: Request,
  props: { params: Promise<{ prospectId: string }> }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId.trim()} })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { prospectId } = await props.params

  // Verify the prospect belongs to this user
  const prospect = await db.prospect.findFirst({
    where: { id: prospectId, userId: user.id },
  })

  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Delete prospect (cascade deletes chat logs)
  await db.prospect.delete({ where: { id: prospectId } })

  return NextResponse.json({ success: true })
}
