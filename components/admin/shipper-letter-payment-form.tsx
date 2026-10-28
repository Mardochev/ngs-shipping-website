"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { updateShipperLetterPayment, type ShipperLetterPaymentState } from "@/lib/actions/shipper-letters"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function initialValue(value: number | null) {
  return value === null || value === undefined ? "" : Number(value).toFixed(2)
}

export function ShipperLetterPaymentForm({
  id,
  price,
  fees,
}: {
  id: string
  price: number | null
  fees: number | null
}) {
  const [priceValue, setPriceValue] = useState(initialValue(price))
  const [feesValue, setFeesValue] = useState(initialValue(fees))
  const [state, formAction, pending] = useActionState<ShipperLetterPaymentState, FormData>(
    updateShipperLetterPayment,
    {},
  )

  const total = Math.round((toNumber(priceValue) + toNumber(feesValue)) * 100) / 100

  const inputClass =
    "w-full rounded-lg border border-input bg-background py-2.5 pl-7 pr-3 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"

  return (
    <section aria-labelledby="payment-heading" className="no-print mb-6 rounded-xl border border-border bg-card p-5">
      <h2 id="payment-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
        Payment
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Staff only. Declared Merchandise Value is not used as the shipping price.
      </p>

      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-price" className="text-sm font-medium text-foreground">
              Price
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <input
                id="payment-price"
                name="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-fees" className="text-sm font-medium text-foreground">
              Assurance fee
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <input
                id="payment-fees"
                name="fees"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={feesValue}
                onChange={(e) => setFeesValue(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id="payment-total-label" className="text-sm font-medium text-foreground">
              Total
            </span>
            <output
              aria-labelledby="payment-total-label"
              aria-live="polite"
              className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-right font-mono text-base font-bold text-foreground"
            >
              {usd.format(total)}
            </output>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-apricot-light disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Save Payment
          </button>
          <p role="status" aria-live="polite" className="text-sm">
            {state.error ? (
              <span className="text-destructive">{state.error}</span>
            ) : state.savedAt && !pending ? (
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" /> Payment saved
              </span>
            ) : null}
          </p>
        </div>
      </form>
    </section>
  )
}
