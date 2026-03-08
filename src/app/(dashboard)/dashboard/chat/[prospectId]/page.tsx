import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getConversation(clerkUserId: string, prospectId: string) {
  const user = await db.user.findUnique({ where: { clerkUserId } })
  if (!user) return null

  const prospect = await db.prospect.findFirst({
    where: { id: prospectId, userId: user.id },
    include: {
      chatLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  return prospect
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ prospectId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { prospectId } = await params
  const prospect = await getConversation(userId, prospectId)

  if (!prospect) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/chat" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Chat Logs
        </Link>
        <p className="text-gray-500">Conversation not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/chat" className="text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
              {prospect.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{prospect.name}</h1>
              <p className="text-xs text-gray-500">
                {prospect.chatLogs.length} messages · {prospect.contact || "No contact info"}
              </p>
            </div>
          </div>
        </div>
        <Badge variant={prospect.status === "CONVERTED" ? "default" : "secondary"}>
          {prospect.status}
        </Badge>
      </div>

      {/* Conversation Thread */}
      <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 min-h-[500px] max-h-[calc(100vh-220px)] overflow-y-auto">
        <div className="space-y-3">
          {prospect.chatLogs.map((log: any) => (
            <div
              key={log.id}
              className={`flex ${log.role === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    log.role === "USER"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
                  }`}
                >
                  {log.content}
                </div>
                <p className={`text-[10px] mt-1 ${log.role === "USER" ? "text-right" : "text-left"} text-gray-400`}>
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
