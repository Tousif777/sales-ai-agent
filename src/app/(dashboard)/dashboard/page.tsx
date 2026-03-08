import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, MessageSquare, Target, TrendingUp } from "lucide-react"

async function getDashboardData(clerkUserId: string) {
  try {
    let user = await db.user.findUnique({ where: { clerkUserId } })
    
    // Auto-sync user if they don't exist in the DB yet
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) return null
      
      user = await db.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        }
      })
    }

    const [
      totalProspects,
      convertedDeals,
      totalChatMessages,
      recentChatLogs
    ] = await Promise.all([
      db.prospect.count({ where: { userId: user.id } }),
      db.prospect.count({ where: { userId: user.id, status: "CONVERTED" } }),
      db.chatLog.count({ where: { role: "AI", prospect: { userId: user.id } } }),
      db.chatLog.findMany({
        where: { prospect: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { prospect: { select: { name: true } } },
      }),
    ])

    const conversionRate = totalProspects > 0 ? Math.round((convertedDeals / totalProspects) * 100) : 0

    return { 
      totalProspects,
      totalChatMessages, 
      convertedDeals, 
      conversionRate, 
      recentChatLogs 
    }
  } catch (error) {
    console.error("Dashboard DB error:", error)
    return "db_error" as const
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
}

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const data = await getDashboardData(clerkUserId)

  // DB not set up yet — show a friendly setup screen
  if (data === "db_error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center text-3xl">
          🔧
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Database Setup Required</h1>
        <p className="text-gray-500 max-w-md">
          The database schema was updated for the Closer Bot pivot. Please run:
        </p>
        <code className="bg-gray-100 border border-gray-200 rounded-lg px-5 py-3 text-sm font-mono text-gray-800">
          npx prisma db push
        </code>
        <p className="text-xs text-gray-400">Then refresh this page.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Overview</h1>
          <p className="text-gray-600">Your agent is being configured. Please wait a moment.</p>
        </div>
      </div>
    )
  }

  const { totalProspects, totalChatMessages, convertedDeals, conversionRate, recentChatLogs } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Overview</h1>
        <p className="text-gray-600">Here&apos;s how your AI Closer is performing today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalProspects}</div>
            <p className="text-xs text-gray-500">Conversations started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalChatMessages}</div>
            <p className="text-xs text-gray-500">By the AI Agent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Converted</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{convertedDeals}</div>
            <p className="text-xs text-gray-500">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{conversionRate}%</div>
            <p className="text-xs text-gray-500">Of total prospects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4">


        <Card>
          <CardHeader>
            <CardTitle>Live Chat Feed</CardTitle>
            <CardDescription>Latest messages sent by your AI</CardDescription>
          </CardHeader>
          <CardContent>
            {recentChatLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No chat history yet.</p>
            ) : (
              <div className="space-y-4">
                {recentChatLogs.map((msg: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      {msg.role === "AI" ? "🤖" : "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-gray-900">{msg.role === "AI" ? "Agent" : msg.prospect.name}</p>
                        <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <div className={`p-2 rounded-lg text-xs leading-relaxed ${msg.role === "AI" ? "bg-indigo-50 text-indigo-900 rounded-tl-none" : "bg-gray-100 text-gray-800 rounded-tr-none"}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
