import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return new NextResponse("Webhook Error", { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle successful checkout — always Pro (Basic is free)
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    const userId = session.metadata?.userId

    if (!userId) {
      return new NextResponse("User ID not found", { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: subscription.customer as string,
        subscriptionId: subscription.id,
        subscriptionStatus: "ACTIVE",
        plan: "PRO",
      },
    })
  }

  // Handle subscription updates
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription

    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    })

    if (user) {
      const priceId = subscription.items.data[0]?.price.id
      const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? "PRO" : "BASIC"

      await db.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: subscription.status === "active" ? "ACTIVE" : 
                              subscription.status === "past_due" ? "PAST_DUE" : 
                              "CANCELED",
          plan,
        },
      })
    }
  }

  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription

    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    })

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "CANCELED",
          plan: "BASIC",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
