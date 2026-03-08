"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send, X, RotateCcw } from "lucide-react"

export default function EmbeddedAgentPage() {
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

  const handleClose = () => {
    window.parent.postMessage("sales-ai-widget-close", "*")
  }

  const resetChat = () => {
    if (confirm("Reset conversation?")) {
      setMessages([])
      sessionStorage.removeItem("salesai_prospect_id")
      const pid = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      sessionStorage.setItem("salesai_prospect_id", pid)
      setProspectId(pid)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Sales Assistant</p>
            <p className="text-[10px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
              Always active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={resetChat}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6 text-gray-400">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <p className="text-2xl">⚡</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Hi! How can I help you today?</p>
              <p className="text-xs mt-1">Ask me about our products, pricing, or specific details.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
              msg.role === "USER"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-10"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-center text-[9px] text-gray-400 mt-2 tracking-tight">
          Powered by <span className="font-semibold text-blue-500">SalesAI Agent</span>
        </p>
      </div>
    </div>
  )
}
