"use client"

import { useId, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  MAX_LETTER_FIXED_ITEMS,
  computeLetterLoad,
  fixedItemCharge,
  type ShipperLetterFixedItem,
} from "@/lib/shipper-letter-types"

type Row = {
  key: number
  description: string
  quantity: string
  unit_price: string
  weight: string
  in_existing_box: boolean
}

let nextKey = 1

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function positive(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function toRow(item?: ShipperLetterFixedItem): Row {
  return {
    key: nextKey++,
    description: item?.description ?? "",
    quantity: item ? String(item.quantity) : "1",
    unit_price: item ? String(item.unit_price) : "",
    weight: item?.weight ? String(item.weight) : "",
    in_existing_box: item?.in_existing_box ?? false,
  }
}

export function FixedItemsField({
  inputClass,
  initialItems,
  parcelWeights,
}: {
  inputClass: string
  initialItems: ShipperLetterFixedItem[]
  parcelWeights: number[]
}) {
  const baseId = useId()
  const [rows, setRows] = useState<Row[]>(() => initialItems.map(toRow))

  const items = rows.map((r) => ({
    description: r.description.trim(),
    quantity: Math.floor(positive(r.quantity)),
    unit_price: positive(r.unit_price),
    weight: positive(r.weight),
    in_existing_box: r.in_existing_box,
  }))
  const load = computeLetterLoad(
    parcelWeights.map((weight) => ({ weight })),
    items,
  )

  function update(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <input type="hidden" name="fixed_items" value={JSON.stringify(items)} />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Fixed-price items</h3>
        <p className="text-sm text-muted-foreground">
          Electronics billed per item, not by the pound. Their weight is kept for the manifest only.
        </p>
      </div>

      {rows.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const id = (field: string) => `${baseId}-${field}-${row.key}`
            const charge = fixedItemCharge({
              quantity: Math.floor(positive(row.quantity)),
              unit_price: positive(row.unit_price),
            })
            return (
              <li key={row.key} className="flex flex-col gap-3 rounded-lg border border-primary/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    Fixed-price item {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove<span className="sr-only"> fixed-price item {index + 1}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={id("desc")} className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <input
                    id={id("desc")}
                    required
                    maxLength={200}
                    placeholder="e.g. 55-inch TV"
                    value={row.description}
                    onChange={(e) => update(row.key, { description: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={id("qty")} className="text-sm font-medium text-foreground">
                      Quantity
                    </label>
                    <input
                      id={id("qty")}
                      type="number"
                      inputMode="numeric"
                      required
                      min="1"
                      max="1000"
                      step="1"
                      value={row.quantity}
                      onChange={(e) => update(row.key, { quantity: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={id("price")} className="text-sm font-medium text-foreground">
                      Shipping price / item ($)
                    </label>
                    <input
                      id={id("price")}
                      type="number"
                      inputMode="decimal"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={row.unit_price}
                      onChange={(e) => update(row.key, { unit_price: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                    <label htmlFor={id("weight")} className="text-sm font-medium text-foreground">
                      Actual weight, all units (lbs)
                    </label>
                    <input
                      id={id("weight")}
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

                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-medium text-foreground">Packing</legend>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name={id("packing")}
                        checked={!row.in_existing_box}
                        onChange={() => update(row.key, { in_existing_box: false })}
                        className="accent-primary"
                      />
                      Its own box (adds {Math.max(1, Math.floor(positive(row.quantity)))}{" "}
                      {Math.floor(positive(row.quantity)) > 1 ? "packages" : "package"})
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name={id("packing")}
                        checked={row.in_existing_box}
                        onChange={() => update(row.key, { in_existing_box: true })}
                        className="accent-primary"
                      />
                      Inside a package listed above
                    </label>
                  </div>
                  {row.in_existing_box ? (
                    <p className="text-xs text-muted-foreground">
                      Its weight is already in that box&apos;s weight, so it is subtracted from per-pound weight and
                      not added to the manifest again.
                    </p>
                  ) : null}
                </fieldset>

                <p className="text-right text-sm text-muted-foreground">
                  Charge: <span className="font-mono font-bold text-foreground">{usd.format(charge)}</span>
                </p>
              </li>
            )
          })}
        </ol>
      ) : null}

      <button
        type="button"
        disabled={rows.length >= MAX_LETTER_FIXED_ITEMS}
        onClick={() => setRows((prev) => [...prev, toRow()])}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add fixed-price item
      </button>

      <dl
        aria-live="polite"
        className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-border bg-secondary/40 p-3 text-sm sm:grid-cols-4"
      >
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Physical packages</dt>
          <dd className="font-bold text-foreground">{load.packageCount}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Manifest weight</dt>
          <dd className="font-mono font-bold text-foreground">{load.totalWeight.toFixed(2)} lbs</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Per-pound weight</dt>
          <dd className="font-mono font-bold text-foreground">{load.perLbWeight.toFixed(2)} lbs</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Fixed-price charge</dt>
          <dd className="font-mono font-bold text-foreground">{usd.format(load.fixedCharge)}</dd>
        </div>
      </dl>
    </div>
  )
}
