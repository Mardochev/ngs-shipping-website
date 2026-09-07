"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { deleteCustomer } from "@/lib/actions/admin"
import type { Customer } from "@/lib/types"
import { Modal } from "./modal"
import { CustomerForm } from "./customer-form"

export function CustomersPanel({ customers }: { customers: Customer[] }) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [query, setQuery] = useState("")

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.customer_code ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, code..."
            className="w-full rounded-lg border border-input bg-navy-deep py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          <Plus className="h-4 w-4" /> Add customer
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No customers yet. Click &quot;Add customer&quot; to create one.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    {c.customer_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">{c.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.destination ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Edit customer"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm(`Delete customer ${c.full_name}?`)) e.preventDefault()
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-red-400"
                          aria-label="Delete customer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Add customer">
        <CustomerForm onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.full_name ?? ""}`}>
        {editing && <CustomerForm customer={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
