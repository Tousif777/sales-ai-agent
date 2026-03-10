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

    // 1. Fetch user and agent config
    const user = await db.user.findUnique({
      where: { clerkUserId: cleanUserId },
      include: { aiAgent: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Agent owner not found" }, { status: 404 })
    }

    // 2. Auto-create a Prospect record
    let dbProspectId: string | null = null
    if (rawProspectId) {
      const prospect = await db.prospect.upsert({
        where: { id: rawProspectId },
        update: {},
        create: { id: rawProspectId, userId: user.id, name: "Anonymous Web Visitor", status: "PENDING" },
      })
      dbProspectId = prospect.id
    }

    // 3. Fetch recent history
    let history: any[] = []
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

    // 4. Save user message
    if (dbProspectId) {
      await db.chatLog.create({ data: { prospectId: dbProspectId, role: "USER", content: message } })
    }

    // 5. Define Tools
    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description: "Search the product catalog by name, category, or features.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keyword" },
              minPrice: { type: "number" },
              maxPrice: { type: "number" },
            },
          },
        },
      },
    ]

    const systemPrompt = (user.aiAgent?.systemPrompt || DEFAULT_SYSTEM_PROMPT) + 
      "\n\nYou have access to a 'search_products' tool. Use it to find information about products when the user asks." +
      "\n\nCRITICAL ORDER RULE: When a purchase is confirmed, append [ORDER:ExactProductName] at the very end." +
      "\nCRITICAL INFO RULE: Capture [NAME:...] and [CONTACT:...] when provided."

    let currentMessages = [...history, { role: "user", content: message }]
    let iterations = 0
    let finalAiMessage: any = null

    // 6. Conversation Loop for Tool Calls
    while (iterations < 3) {
      const aiMsg = await generateChatResponse(currentMessages, systemPrompt, 0.7, tools)
      
      if (!aiMsg.tool_calls) {
        finalAiMessage = aiMsg
        break
      }

      currentMessages.push(aiMsg)

      for (const toolCall of aiMsg.tool_calls) {
        if (toolCall.function.name === "search_products") {
          const args = JSON.parse(toolCall.function.arguments)
          const products = await db.product.findMany({
            where: {
              userId: user.id,
              inStock: true,
              OR: [
                { name: { contains: args.query, mode: "insensitive" } },
                { description: { contains: args.query, mode: "insensitive" } },
                { attributes: { path: ["category"], equals: args.query } }
              ],
              price: { gte: args.minPrice || 0, lte: args.maxPrice || 1000000 }
            },
            take: 5
          })

          const catalog = products.map(p => `- ${p.name}: $${p.price} (${p.description})`).join("\n") || "No matching products found."
          
          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `SEARCH RESULTS:\n${catalog}`
          })
        }
      }
      iterations++
    }

    const aiResponse = finalAiMessage?.content || "I'm sorry, I encountered an issue processing your request."

    // 7. Extract Tags and Create Orders
    const orderMatches = aiResponse.match(/\[ORDER:(.+?)\]/g)
    if (orderMatches && dbProspectId) {
      for (const match of orderMatches) {
        const productName = match.replace("[ORDER:", "").replace("]", "").trim()
        const product = await db.product.findFirst({
          where: { userId: user.id, name: { equals: productName, mode: "insensitive" } }
        })
        if (product) {
          await db.order.create({
            data: {
              userId: user.id,
              prospectId: dbProspectId,
              total: product.price,
              status: "PENDING",
              items: { create: [{ productId: product.id, price: product.price, quantity: 1 }] },
            },
          })
          await db.prospect.update({ where: { id: dbProspectId }, data: { status: "CONVERTED" } })
        }
      }
    }

    // Handle Name/Contact tags
    const nameMatch = aiResponse.match(/\[NAME:(.+?)\]/)
    const contactMatch = aiResponse.match(/\[CONTACT:(.+?)\]/)
    if ((nameMatch || contactMatch) && dbProspectId) {
      await db.prospect.update({
        where: { id: dbProspectId },
        data: { name: nameMatch?.[1].trim(), contact: contactMatch?.[1].trim() }
      })
    }

    const cleanResponse = aiResponse.replace(/\[ORDER:.+?\]/g, "").replace(/\[NAME:.+?\]/g, "").replace(/\[CONTACT:.+?\]/g, "").trim()

    // 8. Save Logs and Update Count
    if (dbProspectId) {
      await Promise.all([
        db.chatLog.create({ data: { prospectId: dbProspectId, role: "AI", content: cleanResponse } }),
        db.user.update({ where: { id: user.id }, data: { messageCount: { increment: 1 } } })
      ])
    }

    return NextResponse.json({ reply: cleanResponse })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
  }
}


