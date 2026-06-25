"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, FileText, Search } from "lucide-react"
import { deleteShipment, updateShipmentStatus } from "@/lib/actions/admin"
import { SHIPMENT_STATUSES, type Customer, type Shipment, type ShipmentWithCustomer } from "@/lib/types"
import { Modal } from "./modal"
import { ShipmentForm } from "./shipment-form"

export function ShipmentsPanel({
  shipments,
  customers,
}: {
  shipments: ShipmentWithCustomer[]
  customers: Customer[]
}) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Shipment | null>(null)
  const [query, setQuery] = useState("")

  const filtered = shipments.filter((s) => {
    const q = query.toLowerCase()
    return (
      s.tracking_number.toLowerCase().includes(q) ||
      (s.customers?.full_name ?? "").toLowerCase().includes(q) ||
      (s.recipient_name ?? "").toLowerCase().includes(q)
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
            placeholder="Search tracking or customer..."
            className="w-full rounded-lg border border-input bg-navy-deep py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          <Plus className="h-4 w-4" /> New shipment
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Tracking #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Weight</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No shipments yet. Click &quot;New shipment&quot; to create one.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{s.tracking_number}</td>
                  <td className="px-4 py-3 text-foreground">
                    {s.customers?.full_name ?? <span className="text-muted-foreground">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.weight_lb} lb</td>
                  <td className="px-4 py-3 text-muted-foreground">${Number(s.cost).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <form action={updateShipmentStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <select
                        name="status"
                        defaultValue={s.status}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="rounded-md border border-input bg-navy-deep px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                        aria-label={`Update status for ${s.tracking_number}`}
                      >
                        {SHIPMENT_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/shipments/${s.id}/invoice`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                        aria-label="View invoice"
                        title="Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Edit shipment"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <form action={deleteShipment}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm(`Delete shipment ${s.tracking_number}?`)) e.preventDefault()
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-red-400"
                          aria-label="Delete shipment"
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

      <Modal open={creating} onClose={() => setCreating(false)} title="New shipment">
        <ShipmentForm customers={customers} onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.tracking_number ?? ""}`}>
        {editing && <ShipmentForm customers={customers} shipment={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
