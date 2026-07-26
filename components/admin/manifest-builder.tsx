"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createManifest } from "@/lib/actions/manifests"
import { MANIFEST_DESTINATIONS, type ShipmentWithCustomer } from "@/lib/types"
import { SubmitButton } from "./submit-button"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function ManifestBuilder({
  eligiblePackages,
  onDone,
}: {
  eligiblePackages: ShipmentWithCustomer[]
  onDone: () => void
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(createManifest, {})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [qty, setQty] = useState<Record<string, number>>({})
  const [val, setVal] = useState<Record<string, number>>({})

  useEffect(() => {
    if (state?.manifestId) {
      router.push(`/admin/manifests/${state.manifestId}`)
      router.refresh()
      onDone()
    }
  }, [state, onDone, router])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === eligiblePackages.length ? new Set() : new Set(eligiblePackages.map((p) => p.id)),
    )
  }

  const totals = useMemo(() => {
    let totalPackages = 0
    let totalWeight = 0
    let totalDeclaredValue = 0
    for (const p of eligiblePackages) {
      if (!selected.has(p.id)) continue
      const q = qty[p.id] ?? p.quantity ?? 1
      const v = val[p.id] ?? Number(p.declared_value) ?? 0
      totalPackages += q
      totalWeight += Number(p.weight_lb) || 0
      totalDeclaredValue += v
    }
    return {
      totalPackages,
      totalWeight: Math.round(totalWeight * 100) / 100,
      totalDeclaredValue: Math.round(totalDeclaredValue * 100) / 100,
    }
  }, [selected, qty, val, eligiblePackages])

  const allSelected = selected.size === eligiblePackages.length && eligiblePackages.length > 0

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <p
          className="rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="destination">
            Destination
          </label>
          <select id="destination" name="destination" defaultValue="" required className={inputClass}>
            <option value="" disabled>
              — Choose destination —
            </option>
            {MANIFEST_DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="shipment_date">
            Shipment date
          </label>
          <input id="shipment_date" name="shipment_date" type="date" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="carrier">
            Cargo carrier / airline
          </label>
          <input
            id="carrier"
            name="carrier"
            placeholder="e.g. Sunrise Airways"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="flight_number">
            Flight / reference number
          </label>
          <input id="flight_number" name="flight_number" placeholder="Optional" className={inputClass} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className={labelClass}>Ready for shipment ({eligiblePackages.length})</p>
          {eligiblePackages.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-secondary/80 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
              <tr>
                <th className="px-3 py-2.5 font-semibold"> </th>
                <th className="px-3 py-2.5 font-semibold">Tracking #</th>
                <th className="px-3 py-2.5 font-semibold">Sender</th>
                <th className="px-3 py-2.5 font-semibold">Receiver</th>
                <th className="px-3 py-2.5 font-semibold">Destination</th>
                <th className="px-3 py-2.5 font-semibold">Qty</th>
                <th className="px-3 py-2.5 font-semibold">Weight</th>
                <th className="px-3 py-2.5 font-semibold">Declared $</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eligiblePackages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    No packages ready for shipment.
                  </td>
                </tr>
              )}
              {eligiblePackages.map((p) => {
                const checked = selected.has(p.id)
                return (
                  <tr key={p.id} className={checked ? "bg-primary/5" : "transition-colors hover:bg-secondary/30"}>
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 accent-primary"
                        aria-label={`Select ${p.tracking_number}`}
                      />
                      {checked && <input type="hidden" name="package_ids" value={p.id} />}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold text-foreground">
                      {p.tracking_number}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.customers?.full_name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      <div>{p.recipient_name ?? "—"}</div>
                      <div className="text-xs">{p.recipient_phone ?? ""}</div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.destination}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="1"
                        name={`qty_${p.id}`}
                        value={qty[p.id] ?? p.quantity ?? 1}
                        onChange={(e) =>
                          setQty((prev) => ({ ...prev, [p.id]: Math.max(1, Number(e.target.value) || 1) }))
                        }
                        disabled={!checked}
                        className="w-16 rounded-md border border-input bg-navy-deep px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.weight_lb} lb</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name={`val_${p.id}`}
                        value={val[p.id] ?? Number(p.declared_value) ?? 0}
                        onChange={(e) =>
                          setVal((prev) => ({ ...prev, [p.id]: Math.max(0, Number(e.target.value) || 0) }))
                        }
                        disabled={!checked}
                        className="w-20 rounded-md border border-input bg-navy-deep px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-navy-deep p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total packages</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{totals.totalPackages}</p>
        </div>
        <div className="rounded-xl border border-border bg-navy-deep p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total weight</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
            {totals.totalWeight} <span className="text-base font-semibold">lb</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-navy-deep p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total declared value</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
            ${totals.totalDeclaredValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
        <SubmitButton pendingText="Generating...">Generate Manifest</SubmitButton>
      </div>
    </form>
  )
}
