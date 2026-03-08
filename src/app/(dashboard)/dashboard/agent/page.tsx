"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

const DEFAULT_PROMPT = `You are Alex, a highly persuasive sales agent. Your goal is to qualify the lead and close the deal.

Rules:
1. Always be polite but confident.
2. If they ask about pricing, present the available products.
3. If they object, highlight benefits.
4. Always ask for their email address or payment confirmation.`

export default function AgentPage() {
  const { userId } = useAuth()
  const [systemPrompt, setSystemPrompt] = useState("")
  const [agentName, setAgentName] = useState("Agent")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [origin, setOrigin] = useState("")
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const testWidget = () => {
    if (widgetLoaded || !userId) return;
    const script = document.createElement("script");
    script.src = `${origin}/widget.js`;
    script.setAttribute("data-user-id", userId);
    script.defer = true;
    document.body.appendChild(script);
    setWidgetLoaded(true);
  }

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((data) => {
        setSystemPrompt(data.systemPrompt || DEFAULT_PROMPT)
        setAgentName(data.name || "Agent")
        setLoading(false)
      })
      .catch(() => {
        setSystemPrompt(DEFAULT_PROMPT)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch("/api/agent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, name: agentName }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Configuration</h1>
        <p className="text-gray-500 text-sm mt-1">Define how your AI closer speaks and types to prospects.</p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-emerald-800">Embed on Your Website</CardTitle>
            <CardDescription className="text-emerald-600">Copy &amp; paste this snippet into your website&apos;s HTML.</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant={widgetLoaded ? "outline" : "default"}
            onClick={testWidget}
            className={!widgetLoaded ? "bg-emerald-600 hover:bg-emerald-700 text-white shrink-0" : "border-emerald-600 text-emerald-700 shrink-0 pointer-events-none"}
          >
            {widgetLoaded ? "Widget Active (Bottom Right)" : "Test Widget Here"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium mb-2 text-gray-700">Option 1: Inline iframe (Best for full-width sections)</p>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
{`<iframe
  src="${origin}/agent/${userId}/embed"
  width="100%"
  height="600"
  style="border:none; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"
></iframe>`}
            </pre>
          </div>

          <div className="border-t border-emerald-200 pt-4">
            <p className="text-sm font-medium mb-2 text-gray-700">Option 2: Floating chat bubble (Recommended)</p>
            <p className="text-xs text-emerald-700 mb-3">Copy this line and paste it just before the &lt;/body&gt; tag of your website.</p>
            <pre className="bg-gray-900 text-indigo-300 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
{`<script 
  src="${origin}/widget.js" 
  data-user-id="${userId}" 
  defer
></script>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Prompt & Personality</CardTitle>
          <CardDescription>Give the AI strict instructions, language preference, FAQs, and pricing info. This defines how your agent behaves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Agent Name</label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Alex, Support Bot"
              className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">System Prompt</label>
            <textarea
              className="w-full min-h-[300px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono leading-relaxed"
              placeholder="You are a ruthless closer for Acme Corp..."
              value={loading ? "Loading..." : systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2">
              💡 Tips: You can instruct the agent to speak a specific language (e.g. &quot;Always reply in Bangla&quot;), set a tone, add FAQs, pricing info, and rules it must follow.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4 mr-2" /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
