"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export default function PublicAgentPage() {
  const params = useParams()
  const userId = params.userId as string

  const [messages, setMessages] = useState<{ role: "AI" | "USER"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [prospectId, setProspectId] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let pid = sessionStorage.getItem("salesai_prospect_id")
    if (!pid) {
      pid = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      sessionStorage.setItem("salesai_prospect_id", pid)
    }
    setProspectId(pid)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    const newMessages = [...messages, { role: "USER" as const, content: userMessage }]

    setMessages(newMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch(`/api/agent/${userId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, prospectId }),
      })

      if (!res.ok) throw new Error("Failed to send message")
      const data = await res.json()
      setMessages([...newMessages, { role: "AI" as const, content: data.reply }])
    } catch {
      setMessages([...newMessages, { role: "AI" as const, content: "Sorry, something went wrong. Please try again." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm">🤖</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">AI Sales Agent</p>
          <p className="text-[11px] text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
            <p className="text-sm">👋 Hi! Send a message to start chatting.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === "USER"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-12"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
