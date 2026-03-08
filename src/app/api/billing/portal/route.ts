import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { createPortalSession } from "@/lib/stripe"

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: clerkUserId.trim() },
    })

    if (!user || !user.stripeCustomerId) {
      return new NextResponse("No billing account found", { status: 404 })
    }

    const session = await createPortalSession(user.stripeCustomerId)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
