"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Mail, FileText, CheckCircle2, XCircle, AlertCircle, Trash2, ShoppingCart } from "lucide-react"
import { DeleteConfirmModal } from "@/components/delete-modal"

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: { 
    name: string
    sku: string | null
    attributes: any
  }
}

type Order = {
  id: string
  status: string
  total: number
  notes: string | null
  createdAt: string
  prospect: { 
    name: string
    contact: string | null
  }
  items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchOrder = async () => {
    const res = await fetch(`/api/orders/${id}`)
    if (res.ok) {
      setOrder(await res.json())
    } else {
      router.push("/dashboard/orders")
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [id])

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchOrder()
  }

  const deleteOrder = async () => {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/dashboard/orders")
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading order details...</div>
  if (!order) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
            <CardHeader className="bg-gray-50/50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order ID</p>
                  <p className="text-sm font-mono text-gray-900">{order.id}</p>
                </div>
                <Badge className={`px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-500" /> Order Items
                  </h3>
                  <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.product.sku && <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-tight">SKU: {item.product.sku}</Badge>}
                            {item.product.attributes && Object.entries(item.product.attributes).map(([k, v]: [string, any]) => (
                              <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dashed">
                  <div className="text-right space-y-1">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="text-3xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" /> Order Notes
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-orange-50/30 p-4 rounded-xl border border-orange-100 italic">
                  "{order.notes}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" /> Customer
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900">{order.prospect.name}</p>
                </div>
                {order.prospect.contact && (
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Contact</p>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Mail className="w-3.5 h-3.5" />
                      {order.prospect.contact}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-blue-50/20">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {order.status === "PENDING" && (
                  <Button onClick={() => updateStatus("CONFIRMED")} className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Order
                  </Button>
                )}
                {order.status === "CONFIRMED" && (
                  <Button onClick={() => updateStatus("COMPLETED")} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                  </Button>
                )}
                {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                  <Button variant="outline" onClick={() => updateStatus("CANCELED")} className="w-full text-red-600 hover:bg-red-50 border-red-200">
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                  </Button>
                )}
                {order.status === "COMPLETED" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" /> This order has been finalized.
                  </div>
                )}
                {order.status === "CANCELED" && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4" /> This order was canceled.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteOrder}
        title="Delete Order Forever?"
        description="This will permanently delete this order and its items. This data cannot be recovered."
      />
    </div>
  )
}
