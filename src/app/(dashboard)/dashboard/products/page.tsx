"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Trash2, Pencil, Package, X, Search } from "lucide-react"
import { DeleteConfirmModal } from "@/components/delete-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  sku: string | null
  stock: number
  inStock: boolean
  attributes?: any
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" })
  const [form, setForm] = useState({ name: "", description: "", price: "", sku: "", stock: "", attributes: {} as Record<string, string> })
  const [newAttr, setNewAttr] = useState({ key: "", value: "" })
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const pageSize = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchProducts = async (page = 1, search = "") => {
    setLoading(true)
    const res = await fetch(`/api/products?page=${page}&limit=${pageSize}&search=${encodeURIComponent(search)}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
      setTotalProducts(data.pagination.totalCount)
      setCurrentPage(data.pagination.currentPage)
    }
    setLoading(false)
  }

  // Effect for page or search change
  useEffect(() => { 
    if (debouncedSearch !== searchQuery) return // Wait for debounce
    fetchProducts(currentPage, debouncedSearch) 
  }, [currentPage, debouncedSearch])

  // Reset to page 1 on new search
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) return

    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }

    setForm({ name: "", description: "", price: "", sku: "", stock: "", attributes: {} })
    setShowForm(false)
    setEditingId(null)
    fetchProducts(currentPage, debouncedSearch)
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    await fetch(`/api/products/${deleteModal.id}`, { method: "DELETE" })
    setDeleteModal({ isOpen: false, id: "" })
    fetchProducts(currentPage, debouncedSearch)
  }

  const handleEdit = (p: Product) => {
    setForm({ 
      name: p.name, 
      description: p.description || "", 
      price: String(p.price), 
      sku: p.sku || "", 
      stock: String(p.stock),
      attributes: p.attributes || {}
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/products/import", { method: "POST", body: formData })
    const data = await res.json()

    if (res.ok) {
      alert(`Successfully imported ${data.imported} products!`)
      fetchProducts(1)
    } else {
      alert(data.error || "Import failed")
    }

    e.target.value = ""
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the products your AI agent can sell.</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span><Upload className="w-4 h-4 mr-2" />Import CSV</span>
            </Button>
          </label>
          <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", price: "", sku: "", stock: "", attributes: {} }) }}>
            <Plus className="w-4 h-4 mr-2" />Add Product
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Search products by name, description, or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingId ? "Edit Product" : "Create New Product"}</DialogTitle>
              <DialogDescription className="text-blue-100/80">
                {editingId 
                  ? "Update product details, pricing, and availability." 
                  : "Add a new product to your catalog for the AI agent to sell."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Product Name</label>
                  <input
                    placeholder="e.g. Premium Dell XPS 15"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Price (USD)</label>
                  <input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">SKU</label>
                  <input
                    placeholder="e.g. DELL-XPS-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Stock Quantity</label>
                  <input
                    placeholder="0"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Description</label>
                <textarea
                  placeholder="Describe the product for your AI agent..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/50 min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Specifications & Attributes</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(form.attributes).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-lg border-none bg-blue-50 text-blue-700 flex items-center gap-2 group">
                      <span className="font-semibold">{k}:</span> {v}
                      <button 
                        type="button" 
                        className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-400 hover:text-red-500"
                        onClick={() => {
                          const next = { ...form.attributes }
                          delete next[k]
                          setForm({ ...form, attributes: next })
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    placeholder="Attribute (e.g. Color)"
                    value={newAttr.key}
                    onChange={(e) => setNewAttr({ ...newAttr, key: e.target.value })}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Value (e.g. Silver)"
                    value={newAttr.value}
                    onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      if (!newAttr.key || !newAttr.value) return
                      setForm({ ...form, attributes: { ...form.attributes, [newAttr.key]: newAttr.value } })
                      setNewAttr({ key: "", value: "" })
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl px-8 shadow-md transition-all active:scale-95"
                >
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading products...</p>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <Package className="w-10 h-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">No products yet</p>
              <p className="text-xs text-gray-500 max-w-[250px]">Add products so your AI agent knows what to sell. Use the "Add Product" button or import a CSV.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">SKU</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</p>}
                      {p.attributes && Object.keys(p.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(p.attributes).map(([k, v]: [string, any]) => (
                            <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit(p)
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteModal({ isOpen: true, id: p.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalProducts)}</span> of <span className="font-medium">{totalProducts}</span> products
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

      {products.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          CSV format: <code className="bg-gray-100 px-1.5 py-0.5 rounded">name,price,description,sku,currency</code>
        </p>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        title="Delete Product?"
        description="Are you sure you want to delete this product? This will remove it from your catalog and AI agents won't be able to sell it."
      />
    </div>
  )
}
