"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Check,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Target,
  ArrowRight,
  Menu,
  Star,
  TrendingUp,
  Shield,
  Bot,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

const features = [
  {
    icon: MessageSquare,
    title: "Instant Web Chat",
    description: "Prospects click a link or hit your website and instantly chat with an intelligent AI closer. No friction.",
    accent: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: Target,
    title: "Catalog Integrated",
    description: "Your AI agent knows your exact products, prices, and stock levels, and recommends them during the chat.",
    accent: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    icon: Bot,
    title: "24/7 Closing Machine",
    description: "Your AI never sleeps. It handles late-night web visitors, answers objections, and takes orders around the clock.",
    accent: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    icon: Zap,
    title: "Automated Orders",
    description: "When a customer wants to buy, the AI automatically creates the order, reduces stock, and logs their contact info.",
    accent: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    icon: TrendingUp,
    title: "Custom Prompting & Languages",
    description: "Tell the AI exactly how to sell. Give it your FAQs and objection scripts, and instruct it to reply in any language.",
    accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: Shield,
    title: "OpenAI Powered",
    description: "Built on the cutting-edge OpenAI GPT-4o architecture for human-like reasoning and hyper-fast response times.",
    accent: "bg-orange-50 text-orange-600 border-orange-100",
  },
]

const steps = [
  {
    number: "01",
    title: "Add Products & Rules",
    description: "Upload your products with stock/prices, and write a system prompt telling the AI how to sell them.",
  },
  {
    number: "02",
    title: "Share or Embed",
    description: "Send prospects to your custom link, or use our simple script to float the AI on your website.",
  },
  {
    number: "03",
    title: "Watch Orders Flow",
    description: "The AI chats with customers, handles objections, gathers their email, and automatically creates orders.",
  },
]

const stats = [
  { value: "0ms", label: "Twilio fees (100% Web AI)" },
  { value: "24/7", label: "Instant Chat Response" },
  { value: "41%", label: "Higher conversion rate" },
  { value: "Auto", label: "E-Commerce Integration" },
]

const faqs = [
  {
    question: "Do I need a phone number or Twilio account?",
    answer: "No. Our agents work entirely in the web browser using text chat. You only pay for your underlying OpenAI API usage.",
  },
  {
    question: "How does the AI know what to sell?",
    answer: "You add your products and prices to the dashboard. The AI automatically reads your product catalog and suggests them to the user.",
  },
  {
    question: "How are orders tracked?",
    answer: "When a customer agrees to buy a product in the chat, the AI automatically creates a Pending order in your dashboard, captures their contact info, and reduces your inventory stock.",
  },
  {
    question: "Can it speak multiple languages?",
    answer: "Yes! The AI can understand and reply in dozens of languages (like Spanish, Bangla, or Hindi). Just add a rule to your Agent Prompt instructing it which language to use.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No — the Basic plan is completely free and starts you off with 100 free AI messages. Upgrade to Pro when you need higher limits.",
  },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            SalesAI
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-100 px-6 rounded-full font-semibold transition-all hover:scale-[1.02] active:scale-95 border-0"
            >
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-gray-100 w-72">
              <div className="flex flex-col h-full pt-6">
                <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-10 px-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  SalesAI
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="flex flex-col gap-3 pb-6">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full rounded-xl border-gray-100">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-100">
                      <Link href="/sign-up">Get Started Free</Link>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-blue-50/60 to-white">
          {/* Subtle background shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-100/40 rounded-full blur-3xl" />
            <div className="absolute top-20 right-0 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Sales Automation
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.08] mb-6 mx-auto max-w-4xl">
              Web-Based AI Sales Agent {" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                That Closes Deals
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed px-2">
              Forget expensive CRM pipelines. Send prospects a link and let your AI talk to them via web chat, recommend products, and automatically create orders — 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4 sm:px-0">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] w-full sm:w-auto"
              >
                <Link href="/sign-up">
                  Start Free — No Card Required
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base text-gray-700 border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16 px-4 sm:px-0">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Dashboard hero card — responsive */}
            <div className="relative mx-auto max-w-5xl px-2 sm:px-0">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/80 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <div className="w-3 h-3 rounded-full bg-yellow-300" />
                    <div className="w-3 h-3 rounded-full bg-green-300" />
                  </div>
                  <div className="flex-1 mx-3 h-5 rounded-md bg-gray-100 text-gray-400 text-xs flex items-center px-3">
                    app.salesai.io/dashboard
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="p-4 sm:p-6 bg-white">
                  {/* Top metrics */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {[
                      { label: "Active Chats", value: "42", sub: "Right now", color: "text-blue-600" },
                      { label: "Messages Sent", value: "8.4K", sub: "This week", color: "text-indigo-600" },
                      { label: "Deals Converted", value: "156", sub: "By the AI", color: "text-emerald-600" },
                    ].map((m, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">{m.label}</p>
                        <p className={cn("text-base sm:text-xl font-bold", m.color)}>{m.value}</p>
                        <p className="text-[9px] sm:text-xs text-gray-400 hidden sm:block">{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lower grid: only show both columns on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
                    {/* Transcription list */}
                    <div className="sm:col-span-3 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Recent Orders & Activity
                      </p>
                      <div className="space-y-2 sm:space-y-3">
                        {[
                          { name: "Anonymous User", duration: "Looking at Pro", intent: "Pricing Qs", status: "Chatting" },
                          { name: "sarah@acme.com", duration: "Bought Pro Plan", intent: "$149.00", status: "Converted" },
                          { name: "Anonymous User", duration: "Abandoned", intent: "Browsing", status: "Ended" },
                        ].map((lead, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {lead.name === "Anonymous User" ? "?" : lead.name[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 truncate hidden sm:block">Length: {lead.duration}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={cn(
                                  "text-[9px] sm:text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex",
                                  lead.status === "Converted" ? "bg-emerald-100 text-emerald-700"
                                  : lead.status === "Chatting" ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-200 text-gray-600"
                                )}
                              >
                                {lead.status}
                              </span>
                              <span className="text-sm font-bold text-gray-700">{lead.intent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI chat preview — hidden on very small / shown on sm+ */}
                    <div className="hidden sm:block sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Live Chat Thread
                      </p>
                      <div className="space-y-2">
                        <div className="bg-white rounded-xl rounded-tl-none border border-gray-100 p-2.5 shadow-sm">
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Hi there! I'm the AI Assistant. I see you're looking at our enterprise plan. Do you have any questions about the SOC2 compliance?
                          </p>
                        </div>
                        <div className="bg-blue-600 rounded-xl rounded-tr-none p-2.5 ml-4">
                          <p className="text-[11px] text-white leading-relaxed">
                            Yes, do you provide the audit report during trial?
                          </p>
                        </div>
                        <div className="bg-white rounded-xl rounded-tl-none border border-gray-100 p-2.5 shadow-sm">
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            Absolutely. If you drop your email here, I'll send the secure link right over and we can get started! 🚀
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom fade */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-100">
                Features
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Everything you need to sell smarter
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                A complete AI-powered sales stack — from first contact to closed deal.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat) => (
                <Card
                  key={feat.title}
                  className="border border-gray-100 bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center mb-2", feat.accent)}>
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-100">
                Process
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Up and running in minutes
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Three simple steps to a fully autonomous AI agent working on your behalf.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {steps.map((step, i) => (
                <div key={step.number} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(100%-1rem)] w-8 h-px bg-gray-200 z-0" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-md shadow-blue-200">
                    <span className="text-xl font-black text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-100">
                Pricing
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Start free. Upgrade when you need scale. No hidden fees, ever.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Basic — Free */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Basic</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-gray-900">Free</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">No credit card. Forever free.</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Up to 100 AI messages / month",
                      "Automated order tracking",
                      "Text-based AI Agent",
                      "Email support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button asChild variant="outline" className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Link href="/sign-up">Get Started Free</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro */}
              <Card className="border-2 border-blue-600 bg-white relative shadow-xl shadow-blue-100">
                {/* Badge */}
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0 px-4 py-1.5 text-xs font-bold shadow-md shadow-blue-300/50">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Most Popular
                  </Badge>
                </div>

                <CardHeader className="pb-4 pt-8">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Pro</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-gray-900">$99</span>
                    <span className="text-gray-400 text-base font-medium ml-1">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">For teams serious about revenue.</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Up to 2,000 AI messages / month",
                      "Unlimited products",
                      "Priority support (24h SLA)",
                      "Custom domains",
                      "API access & webhooks",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                    <Link href="/sign-up">Start with Pro</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Questions? Answered.
              </h2>
              <p className="text-gray-500 text-lg">Everything you need to make the right call.</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-gray-200 rounded-xl px-6 bg-white data-[state=open]:border-blue-200 data-[state=open]:shadow-sm transition-all"
                >
                  <AccordionTrigger className="text-left text-gray-800 hover:text-gray-900 text-sm font-semibold py-5 [&>svg]:text-gray-400">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              Get Started Today
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Ready to let AI <span className="text-blue-600">sell for you?</span>
            </h2>
            <p className="text-gray-500 text-xl mb-10 max-w-2xl mx-auto">
              Join 12,000+ businesses that close more deals with SalesAI. Start free today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] w-full sm:w-auto"
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-10 text-base font-semibold border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              SalesAI
            </div>
            <p className="text-sm text-gray-400">© 2024 SalesAI Inc. All rights reserved.</p>
            <div className="flex items-center gap-8">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <Link key={link} href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
