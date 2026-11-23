"use client"

import { Plus, Trash2 } from "lucide-react"
import { BILLING_MODE_LABELS, MAX_LINE_ITEMS, lineTotal, type BillingMode, type InvoiceLineItem } from "@/lib/invoice-lines"

export type LineDraft = {
  key: string
  description: string
  mode: BillingMode
  quantity: string
  unit_price: string
  weight_lb: string
  rate_per_lb: string
}

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function newLineKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function draftsFromItems(items: InvoiceLineItem[] | null | undefined): LineDraft[] {
  return (items ?? []).map((item) => ({
    key: newLineKey(),
    description: item.description,
    mode: item.mode,
    quantity: item.mode === "flat" ? String(item.quantity) : "1",
    unit_price: item.mode === "flat" ? Number(item.unit_price).toFixed(2) : "",
    weight_lb: item.mode === "per_lb" ? String(item.weight_lb) : "",
    rate_per_lb: item.mode === "per_lb" ? String(item.rate_per_lb) : "",
  }))
}

export function draftToItem(draft: LineDraft): InvoiceLineItem {
  const num = (v: string) => Number.parseFloat(v) || 0
  return {
    description: draft.description.trim(),
    mode: draft.mode,
    quantity: draft.mode === "flat" ? Math.round(num(draft.quantity)) : 1,
    unit_price: draft.mode === "flat" ? num(draft.unit_price) : 0,
    weight_lb: draft.mode === "per_lb" ? num(draft.weight_lb) : 0,
    rate_per_lb: draft.mode === "per_lb" ? num(draft.rate_per_lb) : 0,
  }
}

export function ShipmentLineItems({
  lines,
  onChange,
  defaultRate,
}: {
  lines: LineDraft[]
  onChange: (lines: LineDraft[]) => void
  defaultRate: string
}) {
  function update(key: string, patch: Partial<LineDraft>) {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  function addLine() {
    onChange([
      ...lines,
      {
        key: newLineKey(),
        description: "",
        mode: "per_lb",
        quantity: "1",
        unit_price: "",
        weight_lb: "",
        rate_per_lb: defaultRate,
      },
    ])
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Atik (item lines)</legend>

      {lines.length === 0 && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          No item lines. The invoice uses Weight × Rate for the whole shipment. Add lines to bill phones and other
          devices at a fixed price.
        </p>
      )}

      {lines.map((line, index) => {
        const total = lineTotal(draftToItem(line))
        const id = `line-${line.key}`
        return (
          <div key={line.key} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">Atik {index + 1}</span>
              <button
                type="button"
                onClick={() => onChange(lines.filter((l) => l.key !== line.key))}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-apricot-light transition-colors hover:bg-secondary"
                aria-label={`Remove item ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`${id}-desc`}>
                  Deskripsyon
                </label>
                <input
                  id={`${id}-desc`}
                  value={line.description}
                  maxLength={200}
                  onChange={(e) => update(line.key, { description: e.target.value })}
                  placeholder="e.g. iPhone 13 / Box of clothing"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor={`${id}-mode`}>
                  Mòd faktirasyon
                </label>
                <select
                  id={`${id}-mode`}
                  value={line.mode}
                  onChange={(e) => update(line.key, { mode: e.target.value as BillingMode })}
                  className={inputClass}
                >
                  <option value="per_lb">{BILLING_MODE_LABELS.per_lb}</option>
                  <option value="flat">{BILLING_MODE_LABELS.flat}</option>
                </select>
              </div>
            </div>

            {line.mode === "flat" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor={`${id}-qty`}>
                    Kantite
                  </label>
                  <input
                    id={`${id}-qty`}
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(e) => update(line.key, { quantity: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor={`${id}-price`}>
                    Pri pa aparèy ($)
                  </label>
                  <input
                    id={`${id}-price`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={line.unit_price}
                    onChange={(e) => update(line.key, { unit_price: e.target.value })}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor={`${id}-weight`}>
                    Pwa faktirasyon (lb)
                  </label>
                  <input
                    id={`${id}-weight`}
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    value={line.weight_lb}
                    onChange={(e) => update(line.key, { weight_lb: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass} htmlFor={`${id}-rate`}>
                    Pri pa liv ($)
                  </label>
                  <input
                    id={`${id}-rate`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={line.rate_per_lb}
                    onChange={(e) => update(line.key, { rate_per_lb: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="text-muted-foreground">Total liy</span>
              <span className="font-semibold text-foreground" aria-live="polite">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addLine}
        disabled={lines.length >= MAX_LINE_ITEMS}
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Ajoute atik
      </button>
    </fieldset>
  )
}
