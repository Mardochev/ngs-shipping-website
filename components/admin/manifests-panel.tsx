"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, FileText, Search } from "lucide-react"
import type { Manifest, ManifestStatus, ShipmentWithCustomer } from "@/lib/types"
import { Modal } from "./modal"
import { ManifestBuilder } from "./manifest-builder"

const statusStyles: Record<ManifestStatus, string> = {
  Draft: "bg-secondary text-muted-foreground",
  Manifested: "bg-primary/15 text-primary",
  "Departed USA": "bg-blue-500/15 text-blue-400",
  "Arrived Haiti": "bg-emerald-500/15 text-emerald-400",
  Closed: "bg-secondary text-foreground",
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function ManifestsPanel({
  manifests,
  eligiblePackages,
}: {
  manifests: Manifest[]
  eligiblePackages: ShipmentWithCustomer[]
}) {
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = manifests.filter((m) => {
    const q = query.toLowerCase()
    return (
      m.manifest_number.toLowerCase().includes(q) ||
      m.destination.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
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
            placeholder="Search manifest or destination..."
            className="w-full rounded-lg border border-input bg-navy-deep py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          <Plus className="h-4 w-4" /> Create Manifest
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Manifest #</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Packages</th>
                <th className="px-4 py-3 font-semibold">Weight</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No manifests yet. Click &quot;Create Manifest&quot; to build one.
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{m.manifest_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.shipment_date ?? m.created_at)}</td>
                  <td className="px-4 py-3 text-foreground">{m.destination}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.total_packages}</td>
                  <td className="px-4 py-3 text-muted-foreground">{Number(m.total_weight).toFixed(1)} lb</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[m.status]}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/admin/manifests/${m.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <FileText className="h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Create Manifest">
        <ManifestBuilder eligiblePackages={eligiblePackages} onDone={() => setCreating(false)} />
      </Modal>
    </div>
  )
}
