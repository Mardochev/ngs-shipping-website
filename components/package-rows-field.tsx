"use client"

import { useEffect, useId, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { MAX_LETTER_PACKAGES, type ShipperLetterPackage } from "@/lib/shipper-letter-types"

type Row = { key: number; description: string; weight: string }

let nextKey = 1

function toRows(packages: ShipperLetterPackage[] | undefined, allowEmpty: boolean): Row[] {
  const source =
    packages && (packages.length > 0 || allowEmpty) ? packages : [{ description: "", weight: 0 }]
  return source.map((p) => ({
    key: nextKey++,
    description: p.description,
    weight: p.weight ? String(p.weight) : "",
  }))
}

export function PackageRowsField({
  inputClass,
  initialPackages,
  allowEmpty = false,
  onWeightsChange,
}: {
  inputClass: string
  initialPackages?: ShipperLetterPackage[]
  // Admin edit: a letter may hold only fixed-price items, so every row can be removed.
  allowEmpty?: boolean
  onWeightsChange?: (weights: number[]) => void
}) {
  const baseId = useId()
  const [rows, setRows] = useState<Row[]>(() => toRows(initialPackages, allowEmpty))

  const totalWeight =
    Math.round(rows.reduce((sum, r) => sum + (Number(r.weight) > 0 ? Number(r.weight) : 0), 0) * 100) / 100
  const serialized = JSON.stringify(
    rows.map((r) => ({ description: r.description.trim(), weight: Number(r.weight) })),
  )

  const weightsKey = rows.map((r) => r.weight).join("|")
  useEffect(() => {
    onWeightsChange?.(weightsKey === "" ? [] : weightsKey.split("|").map((w) => (Number(w) > 0 ? Number(w) : 0)))
  }, [weightsKey, onWeightsChange])

  function update(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <input type="hidden" name="packages" value={serialized} />

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          No per-pound packages. Add one if any fixed-price item is packed inside a box.
        </p>
      ) : null}
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const descId = `${baseId}-desc-${row.key}`
          const weightId = `${baseId}-weight-${row.key}`
          return (
            <li key={row.key} className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">Package {index + 1}</span>
                {rows.length > 1 || allowEmpty ? (
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove<span className="sr-only"> package {index + 1}</span>
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor={descId} className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <input
                    id={descId}
                    required
                    maxLength={200}
                    placeholder="e.g. Television"
                    value={row.description}
                    onChange={(e) => update(row.key, { description: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:w-36">
                  <label htmlFor={weightId} className="text-sm font-medium text-foreground">
                    Actual weight (lbs)
                  </label>
                  <input
                    id={weightId}
                    type="number"
                    inputMode="decimal"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={row.weight}
                    onChange={(e) => update(row.key, { weight: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={rows.length >= MAX_LETTER_PACKAGES}
          onClick={() => setRows((prev) => [...prev, { key: nextKey++, description: "", weight: "" }])}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add package
        </button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">
            {rows.length} {rows.length === 1 ? "package" : "packages"}
          </span>
          {" · "}
          <span className="font-mono font-bold text-foreground">{totalWeight.toFixed(2)} lbs</span> total
        </p>
      </div>
    </div>
  )
}
