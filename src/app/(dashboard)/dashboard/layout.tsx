"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Bot, 
  BarChart3, 
  Settings,
  Zap,
  Menu,
  PhoneCall,
  Cog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

const sidebarItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/products", icon: Bot, label: "Products" },
  { href: "/dashboard/orders", icon: Users, label: "Orders" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Chat Logs" },
  { href: "/dashboard/agent", icon: Settings, label: "Agent Config" },
  { href: "/dashboard/settings", icon: Cog, label: "Settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isLoaded, user } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">SalesAI</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3 px-3 py-2">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {isLoaded && user ? user.fullName || "User" : "Loading..."}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {isLoaded && user ? user.primaryEmailAddress?.emailAddress : "Account"}
            </span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col top-0 bottom-0 sticky h-screen z-10">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">SalesAI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <UserButton />
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white border-r-gray-200">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
