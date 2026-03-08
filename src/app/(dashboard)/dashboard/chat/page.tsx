"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, ChevronRight, Trash2 } from "lucide-react"

type Prospect = {
  id: string
  name: string
  status: string
  updatedAt: string
  chatLogs: { role: string; content: string; createdAt: string }[]
  _count: { chatLogs: number }
}

export default function ChatLogsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChats = async () => {
    const res = await fetch("/api/chat")
    if (res.ok) {
      const data = await res.json()
      setProspects(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchChats() }, [])

  const deleteChat = async (prospectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this conversation?")) return
    await fetch(`/api/chat/${prospectId}`, { method: "DELETE" })
    fetchChats()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Click a prospect to view the full conversation.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading conversations...</p>
      ) : prospects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <p className="text-sm font-medium text-gray-900">No chat history yet</p>
              <p className="text-xs text-gray-500 max-w-[250px]">When prospects text your agent, conversations will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {prospects.map((prospect) => {
            const lastMsg = prospect.chatLogs[0]
            const msgCount = prospect._count.chatLogs

            return (
              <div key={prospect.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                <Link
                  href={`/dashboard/chat/${prospect.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-lg font-semibold">
                    {prospect.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{prospect.name}</p>
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                        {new Date(lastMsg?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate max-w-[300px]">
                        {lastMsg?.role === "AI" ? "AI: " : ""}{lastMsg?.content}
                      </p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {msgCount} msgs
                        </Badge>
                        <Badge variant={prospect.status === "CONVERTED" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {prospect.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-300 hover:text-red-600 shrink-0"
                  onClick={(e) => deleteChat(prospect.id, e)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
