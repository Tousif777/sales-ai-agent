import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
})

export const PLANS = {
  BASIC: {
    name: "Basic",
    price: 0, // Free — no Stripe required
    priceId: null,
    features: [
      "1,000 leads",
      "5,000 AI messages/month",
      "Lead qualification",
      "Email support",
    ],
    limits: {
      leads: 1000,
      messages: 5000,
    },
  },
  PRO: {
    name: "Pro",
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Unlimited leads",
      "Unlimited AI messages",
      "Priority support",
      "Custom integrations",
      "API access",
    ],
    limits: {
      leads: Infinity,
      messages: Infinity,
    },
  },
} as const

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}
