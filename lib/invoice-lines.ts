// Shared invoice math for the shipment form, server actions, invoice/PDF and
// thermal receipt, so every surface computes identical totals.

export type BillingMode = "per_lb" | "flat"

export type InvoiceLineItem = {
  description: string
  mode: BillingMode
  quantity: number
  unit_price: number
  weight_lb: number
  rate_per_lb: number
}

export type ComputedLine = InvoiceLineItem & { total: number }

export const MAX_LINE_ITEMS = 50

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  per_lb: "Pa liv",
  flat: "Pri fiks pa aparèy",
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export type PaymentCurrency = "USD" | "HTG"
export const PAYMENT_CURRENCIES: PaymentCurrency[] = ["USD", "HTG"]
export const MAX_HTG_RATE = 100000

export function htgTotal(totalUsd: number, rate: number) {
  return roundMoney(totalUsd * rate)
}

// Returns null for a blank value, NaN for an invalid one.
export function parseHtgRate(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === "") return null
  const rate = Number.parseFloat(trimmed)
  if (!Number.isFinite(rate) || rate <= 0 || rate > MAX_HTG_RATE) return Number.NaN
  return Math.round(rate * 10000) / 10000
}

export function lineTotal(item: Pick<InvoiceLineItem, "mode" | "quantity" | "unit_price" | "weight_lb" | "rate_per_lb">) {
  return item.mode === "flat"
    ? roundMoney(item.quantity * item.unit_price)
    : roundMoney(item.weight_lb * item.rate_per_lb)
}

export function billableWeight(items: InvoiceLineItem[]) {
  return Math.round(items.reduce((sum, i) => sum + (i.mode === "per_lb" ? i.weight_lb : 0), 0) * 100) / 100
}

function finite(value: unknown) {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""))
  return Number.isFinite(n) ? n : NaN
}

// Validates the JSON submitted by the shipment form. Returns an empty array
// when no lines were added (legacy single-line billing).
export function parseLineItems(raw: string): { items: InvoiceLineItem[] } | { error: string } {
  if (!raw.trim()) return { items: [] }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: "Invalid item lines." }
  }
  if (!Array.isArray(parsed)) return { error: "Invalid item lines." }
  if (parsed.length > MAX_LINE_ITEMS) return { error: `A maximum of ${MAX_LINE_ITEMS} item lines is allowed.` }

  const items: InvoiceLineItem[] = []
  for (const [index, entry] of parsed.entries()) {
    const row = (entry ?? {}) as Record<string, unknown>
    const n = index + 1
    const description = String(row.description ?? "").trim().slice(0, 200)
    const mode = row.mode === "flat" ? "flat" : row.mode === "per_lb" ? "per_lb" : null
    if (!description) return { error: `Item ${n}: description is required.` }
    if (!mode) return { error: `Item ${n}: choose a billing mode.` }

    if (mode === "flat") {
      const quantity = finite(row.quantity)
      const unitPrice = finite(row.unit_price)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
        return { error: `Item ${n}: quantity must be a whole number from 1 to 1000.` }
      }
      if (Number.isNaN(unitPrice) || unitPrice < 0 || unitPrice > 100000) {
        return { error: `Item ${n}: enter a valid price per device.` }
      }
      items.push({ description, mode, quantity, unit_price: roundMoney(unitPrice), weight_lb: 0, rate_per_lb: 0 })
    } else {
      const weight = finite(row.weight_lb)
      const rate = finite(row.rate_per_lb)
      if (Number.isNaN(weight) || weight <= 0 || weight > 100000) {
        return { error: `Item ${n}: billable weight must be greater than zero.` }
      }
      if (Number.isNaN(rate) || rate < 0 || rate > 100000) {
        return { error: `Item ${n}: enter a valid price per pound.` }
      }
      items.push({
        description,
        mode,
        quantity: 1,
        unit_price: 0,
        weight_lb: Math.round(weight * 100) / 100,
        rate_per_lb: roundMoney(rate),
      })
    }
  }
  return { items }
}

type BillableShipment = {
  description: string | null
  weight_lb: number
  cost: number
  rate_per_lb: number | null
  general_fee: number | null
  insurance_fee?: number | null
  line_items?: InvoiceLineItem[] | null
  payment_currency?: string | null
  exchange_rate?: number | null
  total_htg?: number | null
}

// Shipments saved before item lines existed have no line_items and keep the
// exact original Weight × Rate + General Fee calculation.
export function computeInvoice(shipment: BillableShipment) {
  const generalFee = Math.max(0, Number(shipment.general_fee) || 0)
  const insurance = Math.max(0, Number(shipment.insurance_fee) || 0)
  const stored = Array.isArray(shipment.line_items) ? shipment.line_items : []

  let lines: ComputedLine[]
  if (stored.length > 0) {
    lines = stored.map((item) => {
      const normalized: InvoiceLineItem = {
        description: item.description,
        mode: item.mode === "flat" ? "flat" : "per_lb",
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        weight_lb: Number(item.weight_lb) || 0,
        rate_per_lb: Number(item.rate_per_lb) || 0,
      }
      return { ...normalized, total: lineTotal(normalized) }
    })
  } else {
    const weight = Number(shipment.weight_lb) || 0
    const rate =
      shipment.rate_per_lb != null ? Number(shipment.rate_per_lb) : weight > 0 ? Number(shipment.cost) / weight : 0
    lines = [
      {
        description: shipment.description || "Air cargo shipment to Haiti",
        mode: "per_lb",
        quantity: 1,
        unit_price: 0,
        weight_lb: weight,
        rate_per_lb: rate,
        total: roundMoney(weight * rate),
      },
    ]
  }

  const subtotal = roundMoney(lines.reduce((sum, l) => sum + l.total, 0))
  const total = roundMoney(subtotal + generalFee + insurance)

  // The HTG amount saved with the invoice is shown as-is, so later changes to
  // today's rate never alter an existing invoice.
  const rate = shipment.exchange_rate != null && Number(shipment.exchange_rate) > 0 ? Number(shipment.exchange_rate) : null
  const payment = {
    currency: (shipment.payment_currency === "HTG" ? "HTG" : "USD") as PaymentCurrency,
    rate,
    totalHtg: rate == null ? null : shipment.total_htg != null ? Number(shipment.total_htg) : htgTotal(total, rate),
  }
  return { lines, subtotal, generalFee, insurance, total, payment, isLegacy: stored.length === 0 }
}
