import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageSquare, Target, Clock } from "lucide-react"

export default function AnalyticsPage() {
  // Mock analytics data - in production, this would come from the database
  const analytics = {
    totalLeads: { value: 1234, change: 12 },
    qualifiedLeads: { value: 456, change: 8 },
    conversations: { value: 789, change: -3 },
    avgResponseTime: { value: "2.5", change: -15 },
    conversionRate: { value: 27, change: 5 },
    aiMessages: { value: 3456, change: 22 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-600">Track your sales performance and AI activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Leads"
          value={analytics.totalLeads.value.toLocaleString()}
          change={analytics.totalLeads.change}
          icon={Users}
        />
        <MetricCard
          title="Qualified Leads"
          value={analytics.qualifiedLeads.value.toLocaleString()}
          change={analytics.qualifiedLeads.change}
          icon={Target}
        />
        <MetricCard
          title="Conversations"
          value={analytics.conversations.value.toLocaleString()}
          change={analytics.conversations.change}
          icon={MessageSquare}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${analytics.avgResponseTime.value}s`}
          change={analytics.avgResponseTime.change}
          icon={Clock}
          invertChange
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.value}%`}
          change={analytics.conversionRate.change}
          icon={TrendingUp}
        />
        <MetricCard
          title="AI Messages"
          value={analytics.aiMessages.value.toLocaleString()}
          change={analytics.aiMessages.change}
          icon={MessageSquare}
        />
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Over Time</CardTitle>
            <CardDescription>New leads captured per week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FunnelItem label="New Leads" value={1234} percentage={100} />
              <FunnelItem label="Contacted" value={890} percentage={72} />
              <FunnelItem label="Qualified" value={456} percentage={37} />
              <FunnelItem label="Won" value={234} percentage={19} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  invertChange = false,
}: {
  title: string
  value: string
  change: number
  icon: React.ElementType
  invertChange?: boolean
}) {
  const isPositive = invertChange ? change < 0 : change > 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(change)}% from last month
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelItem({ label, value, percentage }: { label: string; value: number; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
