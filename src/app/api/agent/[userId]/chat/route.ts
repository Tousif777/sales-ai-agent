import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateChatResponse, DEFAULT_SYSTEM_PROMPT } from "@/lib/openai"

export async function POST(
  req: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await props.params
    const { message, prospectId: rawProspectId } = await req.json()
    
    // Trim any potential whitespace from the URL parameter for robustness
    const cleanUserId = params.userId?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 1. Fetch user, agent config, and product catalog
    const user = await db.user.findUnique({
      where: { clerkUserId: cleanUserId },
      include: { aiAgent: true, products: { where: { inStock: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: "Agent owner not found" }, { status: 404 })
    }

    // 2. Auto-create a Prospect record if one doesn't exist yet
    let dbProspectId: string | null = null

    if (rawProspectId) {
      const prospect = await db.prospect.upsert({
        where: { id: rawProspectId },
        update: {},
        create: {
          id: rawProspectId,
          userId: user.id,
          name: "Anonymous Web Visitor",
          status: "PENDING",
        },
      })
      dbProspectId = prospect.id
    }

    // 3. Fetch recent chat history for context
    let history: { role: "user" | "assistant"; content: string }[] = []

    if (dbProspectId) {
      const dbLogs = await db.chatLog.findMany({
        where: { prospectId: dbProspectId },
        orderBy: { createdAt: "asc" },
        take: 20,
      })

      history = dbLogs.map((log: any) => ({
        role: log.role === "USER" ? "user" : "assistant",
        content: log.content,
      }))
    }

    // 4. Save the incoming user message
    if (dbProspectId) {
      await db.chatLog.create({
        data: {
          prospectId: dbProspectId,
          role: "USER",
          content: message,
        },
      })
    }

    // 5. Build the system prompt with product catalog
    let systemPrompt = user.aiAgent?.systemPrompt || DEFAULT_SYSTEM_PROMPT

    if (user.products.length > 0) {
      const catalog = user.products
        .map((p: any) => {
          let details = `- ${p.name}: $${p.price.toFixed(2)}${p.description ? ` (${p.description})` : ""}`
          if (p.attributes && Object.keys(p.attributes).length > 0) {
            const attrs = Object.entries(p.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")
            details += ` [Attributes: ${attrs}]`
          }
          return details
        })
        .join("\n")

      systemPrompt += `\n\n---\nAVAILABLE PRODUCTS:\n${catalog}\n\nCRITICAL ORDER RULE: You MUST follow this rule exactly. When a customer says they want to buy, purchase, or order a product, you MUST append the exact tag [ORDER:ExactProductName] at the very end of your response message. Use the exact product name from the list above. For example, if the product is "Pro Plan" and the user says "I want to buy it", your response must end with [ORDER:Pro Plan]. NEVER skip this tag when a purchase is confirmed. If they want multiple items, add multiple tags like [ORDER:Item1] [ORDER:Item2].\n\nCRITICAL INFO RULE: If the user provides their name, append [NAME:TheirName] to your response. If they provide their email or phone number, append [CONTACT:TheirEmailOrPhone].`
    } else {
      systemPrompt += `\n\nCRITICAL INFO RULE: If the user provides their name, append [NAME:TheirName] to your response. If they provide their email or phone number, append [CONTACT:TheirEmailOrPhone].`
    }

    // 6. Generate AI response
    const messages = [
      ...history,
      { role: "user" as const, content: message },
    ]

    const aiResponse = await generateChatResponse(messages, systemPrompt)

    console.log("[CHAT] AI raw response:", aiResponse)

    // 7. Check for order tags and auto-create orders
    const orderMatches = aiResponse.match(/\[ORDER:(.+?)\]/g)
    console.log("[CHAT] Order tags found:", orderMatches)
    if (orderMatches && dbProspectId) {
      const orderItems: { productId: string; price: number; quantity: number }[] = []

      for (const match of orderMatches) {
        const productName = match.replace("[ORDER:", "").replace("]", "").trim()
        const product = user.products.find(
          (p: any) => p.name.toLowerCase() === productName.toLowerCase()
        )
        if (product) {
          orderItems.push({ productId: product.id, price: product.price, quantity: 1 })
        }
      }

      if (orderItems.length > 0) {
        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

        await db.order.create({
          data: {
            userId: user.id,
            prospectId: dbProspectId,
            total,
            status: "PENDING",
            notes: `Auto-created by AI agent`,
            items: {
              create: orderItems,
            },
          },
        })

        // Mark prospect as converted
        await db.prospect.update({
          where: { id: dbProspectId },
          data: { status: "CONVERTED" },
        })
      }
    }

    // 8. Extract Name and Contact info
    const nameMatch = aiResponse.match(/\[NAME:(.+?)\]/)
    const contactMatch = aiResponse.match(/\[CONTACT:(.+?)\]/)

    if ((nameMatch || contactMatch) && dbProspectId) {
      const updateData: any = {}
      if (nameMatch) updateData.name = nameMatch[1].trim()
      if (contactMatch) updateData.contact = contactMatch[1].trim()

      await db.prospect.update({
        where: { id: dbProspectId },
        data: updateData,
      })
    }

    // 9. Clean all tags from the visible response
    const cleanResponse = aiResponse
      .replace(/\[ORDER:.+?\]/g, "")
      .replace(/\[NAME:.+?\]/g, "")
      .replace(/\[CONTACT:.+?\]/g, "")
      .trim()

    // 9. Save the AI's response and increment User's message count
    if (dbProspectId) {
      // Run both creations and updates in parallel
      await Promise.all([
        db.chatLog.create({
          data: {
            prospectId: dbProspectId,
            role: "AI",
            content: cleanResponse,
          },
        }),
        db.user.update({
          where: { id: user.id },
          data: { messageCount: { increment: 1 } },
        }),
      ])
    }

    return NextResponse.json({ reply: cleanResponse })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
  }
}


