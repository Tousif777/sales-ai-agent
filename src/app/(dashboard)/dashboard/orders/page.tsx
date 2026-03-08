"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2 } from "lucide-react"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: { name: string }
}

type Order = {
  id: string
  status: string
  total: number
  notes: string | null
  createdAt: string
  prospect: { name: string; contact: string | null }
  items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const res = await fetch("/api/orders")
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Delete this order?")) return
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
    fetchOrders()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Deals converted by your AI agent appear here.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">No orders yet</p>
              <p className="text-xs text-gray-500 max-w-[280px]">When your AI agent closes a deal, the order will appear here automatically.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{order.prospect.name}</p>
                      <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </Badge>
                    </div>
                    {order.prospect.contact && (
                      <p className="text-xs text-gray-600 mb-1">{order.prospect.contact}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                    {order.notes && <p className="text-xs text-gray-400 mt-1 truncate">{order.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      {order.status === "PENDING" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => updateStatus(order.id, "CONFIRMED")}>
                          Confirm
                        </Button>
                      )}
                      {order.status === "CONFIRMED" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => updateStatus(order.id, "COMPLETED")}>
                          Complete
                        </Button>
                      )}
                      {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-600 hover:text-red-700" onClick={() => updateStatus(order.id, "CANCELED")}>
                          Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600" onClick={() => deleteOrder(order.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {order.items.length > 0 && (
                  <div className="border-t bg-gray-50/50 px-4 py-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs py-1">
                        <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                        <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
