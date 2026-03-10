"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Search, X, Eye } from "lucide-react"
import { DeleteConfirmModal } from "@/components/delete-modal"

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

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" })
  const pageSize = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchOrders = async (page = 1, search = "", status = "ALL") => {
    setLoading(true)
    const res = await fetch(`/api/orders?page=${page}&limit=${pageSize}&search=${encodeURIComponent(search)}&status=${status}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setTotalPages(data.pagination.totalPages)
      setTotalOrders(data.pagination.totalCount)
      setCurrentPage(data.pagination.currentPage)
    }
    setLoading(false)
  }

  // Effect for page or search change
  useEffect(() => { 
    if (debouncedSearch !== searchQuery) return
    fetchOrders(currentPage, debouncedSearch, statusFilter) 
  }, [currentPage, debouncedSearch, statusFilter])

  // Reset to page 1 on new search
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  const updateStatus = async (e: React.MouseEvent, orderId: string, status: string) => {
    e.preventDefault()
    e.stopPropagation()
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchOrders(currentPage, debouncedSearch, statusFilter)
  }

  const deleteOrder = async () => {
    if (!deleteModal.id) return
    await fetch(`/api/orders/${deleteModal.id}`, { method: "DELETE" })
    setDeleteModal({ isOpen: false, id: "" })
    fetchOrders(currentPage, debouncedSearch, statusFilter)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Deals converted by your AI agent appear here.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === s 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search customer, product, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
        <div className="space-y-4">
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:ring-1 hover:ring-blue-500/30 transition-shadow">
                <Link href={`/dashboard/orders/${order.id}`}>
                  <CardContent className="p-0">
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 underline-offset-4 hover:underline">{order.prospect.name}</p>
                          <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[order.status] || ""}`}>
                            {order.status}
                          </Badge>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1">
                            <Eye className="w-2.5 h-2.5" /> View Details
                          </span>
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
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={(e) => updateStatus(e, order.id, "CONFIRMED")}>
                              Confirm
                            </Button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={(e) => updateStatus(e, order.id, "COMPLETED")}>
                              Complete
                            </Button>
                          )}
                          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-600 hover:text-red-700" onClick={(e) => updateStatus(e, order.id, "CANCELED")}>
                              Cancel
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600" 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setDeleteModal({ isOpen: true, id: order.id })
                            }}
                          >
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
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalOrders)}</span> of <span className="font-medium">{totalOrders}</span> orders
              </p>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2"
                >
                  Previous
                </Button>
                <div className="flex gap-1 mx-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="h-8 w-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={deleteOrder}
        title="Delete Order?"
        description="Are you sure you want to delete this order? This action will remove the order history for this prospect."
      />
    </div>
  )
}
