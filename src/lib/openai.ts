import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const DEFAULT_SYSTEM_PROMPT = `You are a professional AI sales closer designed to talk to prospects directly via voice or text chat.

Your key responsibilities:
1. Qualify the prospect based on their responses.
2. Build rapport using a natural, human-like conversational tone.
3. Answer questions about the product, pricing, and features.
4. Overcome objections and guide the prospect toward closing the deal or booking a meeting.
5. Always ask for their contact information (email/phone) if they want you to send them something.

Guidelines:
- If communicating via voice, use short, punchy sentences so the text-to-speech sounds natural.
- Do not use markdown or complex formatting in voice responses.
- Ask clarifying questions to keep the conversation engaging.
- Never make false promises or claims.`

export async function generateChatResponse(
  messages: { role: "user" | "assistant" | "system" | "tool"; content: string; tool_call_id?: string; name?: string }[],
  systemPrompt?: string,
  temperature: number = 0.7,
  tools?: any[]
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages as any,
    ],
    temperature,
    tools: tools && tools.length > 0 ? tools : undefined,
    tool_choice: tools && tools.length > 0 ? "auto" : undefined,
    max_tokens: 1000,
  })

  return response.choices[0]?.message
}
