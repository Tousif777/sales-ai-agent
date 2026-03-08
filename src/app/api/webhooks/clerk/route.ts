import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env")
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", { status: 400 })
  }

  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, primary_email_address_id } = evt.data
    
    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    )

    if (!primaryEmail) {
      return new Response("No primary email found", { status: 400 })
    }

    // Create user in database (create() returns the new record directly)
    const newUser = await db.user.create({
      data: {
        clerkUserId: id,
        email: primaryEmail.email_address,
      },
    })

    // Create default AI agent for the user
    await db.aIAgent.create({
      data: {
        userId: newUser.id,
        name: "Sales Assistant",
        systemPrompt: `You are a professional AI sales assistant designed to help with lead qualification, customer outreach, and sales conversations.

Your key responsibilities:
1. Qualify leads using the BANT framework (Budget, Authority, Need, Timeline)
2. Maintain a professional yet friendly conversational tone
3. Identify pain points and buying signals
4. Gather key information without being pushy
5. Provide helpful, relevant responses to sales-related queries`,
      },
    })
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data
    
    if (id) {
      await db.user.delete({
        where: { clerkUserId: id },
      })
    }
  }

  return NextResponse.json({ message: "Webhook processed" })
}
