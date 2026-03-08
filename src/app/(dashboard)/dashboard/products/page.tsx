"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Trash2, Pencil, Package, X } from "lucide-react"

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
  const [form, setForm] = useState({ name: "", description: "", price: "", sku: "", stock: "", attributes: {} as Record<string, string> })
  const [newAttr, setNewAttr] = useState({ key: "", value: "" })

  const fetchProducts = async () => {
    const res = await fetch("/api/products")
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

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
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    fetchProducts()
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
      fetchProducts()
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

      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editingId ? "Edit Product" : "New Product"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="Product name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <input
                placeholder="Price *"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <input
                placeholder="SKU (optional)"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                placeholder="Stock qty"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="md:col-span-4 border-t pt-2 mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">Custom Fields (Color, Size, etc.)</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(form.attributes).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                      {k}: {v}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 hover:bg-transparent text-gray-400 hover:text-red-500"
                        onClick={() => {
                          const next = { ...form.attributes }
                          delete next[k]
                          setForm({ ...form, attributes: next })
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Field name (e.g. Color)"
                    value={newAttr.key}
                    onChange={(e) => setNewAttr({ ...newAttr, key: e.target.value })}
                    className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-1/3"
                  />
                  <input
                    placeholder="Value (e.g. Blue)"
                    value={newAttr.value}
                    onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })}
                    className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-1/3"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (!newAttr.key || !newAttr.value) return
                      setForm({ ...form, attributes: { ...form.attributes, [newAttr.key]: newAttr.value } })
                      setNewAttr({ key: "", value: "" })
                    }}
                  >
                    Add Field
                  </Button>
                </div>
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 md:col-start-4">
                {editingId ? "Update Product" : "Create Product"}
              </Button>
              <input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:col-span-4"
              />
            </form>
          </CardContent>
        </Card>
      )}

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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          CSV format: <code className="bg-gray-100 px-1.5 py-0.5 rounded">name,price,description,sku,currency</code>
        </p>
      )}
    </div>
  )
}
