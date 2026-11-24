"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Loader2, Trash2 } from "lucide-react"
import {
  confirmShipperLetterPaymentHistory,
  deleteShipperLetterPayment,
  recordShipperLetterPayment,
  type RecordLetterPaymentState,
} from "@/lib/actions/shipper-letters"
import {
  PAYMENT_CURRENCIES,
  PAYMENT_LOCATIONS,
  PAYMENT_METHODS,
  summarizeLetterPayments,
  type PaymentCurrency,
  type ShipperLetterPayment,
} from "@/lib/shipper-letter-types"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const htg = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground [color-scheme:dark] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"

function todayIso() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function formatPaymentAmount(p: Pick<ShipperLetterPayment, "amount" | "currency">) {
  return p.currency === "HTG" ? `${htg.format(p.amount)} HTG` : usd.format(p.amount)
}

export function ShipperLetterPaymentsPanel({
  id,
  total,
  payments,
  historyVerified,
  defaultHtgRate,
}: {
  id: string
  total: number | null
  payments: ShipperLetterPayment[]
  historyVerified: boolean
  defaultHtgRate: number | null
}) {
  const [state, formAction, pending] = useActionState<RecordLetterPaymentState, FormData>(
    recordShipperLetterPayment,
    {},
  )
  const [currency, setCurrency] = useState<PaymentCurrency>("USD")
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState(defaultHtgRate ? String(defaultHtgRate) : "")
  const [formKey, setFormKey] = useState(0)
  const [lastSaved, setLastSaved] = useState<number | undefined>(undefined)

  if (state.savedAt && state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt)
    setAmount("")
    setFormKey((k) => k + 1)
  }

  const summary = summarizeLetterPayments(total, payments, historyVerified)
  const balance = summary.balanceDue ?? 0
  const fullyRecorded = summary.invoiceTotal !== null && summary.invoiceTotal > 0 && balance === 0
  const rateNumber = Number(rate)
  const amountNumber = Number(amount)
  const usdPreview =
    currency === "HTG" && rateNumber > 0 && amountNumber > 0 ? Math.round((amountNumber / rateNumber) * 100) / 100 : null

  function fillAmount(usdAmount: number) {
    const rounded = Math.round(usdAmount * 100) / 100
    setAmount(
      currency === "HTG" && rateNumber > 0 ? (Math.round(rounded * rateNumber * 100) / 100).toFixed(2) : rounded.toFixed(2),
    )
  }

  const canRecord = summary.invoiceTotal !== null && summary.invoiceTotal > 0 && !fullyRecorded

  return (
    <section aria-labelledby="payments-heading" className="no-print mb-6 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="payments-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Payments received
        </h2>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
          {summary.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <dt className="text-muted-foreground">Invoice total</dt>
          <dd className="font-mono font-bold text-foreground">
            {summary.invoiceTotal === null ? "—" : usd.format(summary.invoiceTotal)}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <dt className="text-muted-foreground">Total paid</dt>
          <dd className="font-mono font-bold text-foreground">{usd.format(summary.totalPaid)}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-primary/40 bg-primary/10 p-3">
          <dt className="text-muted-foreground">Balance due</dt>
          <dd className="font-mono font-bold text-foreground">
            {!summary.balanceConfirmed ? "To verify" : summary.balanceDue === null ? "—" : usd.format(summary.balanceDue)}
          </dd>
        </div>
      </dl>

      {!historyVerified ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
          <p className="leading-relaxed text-foreground">
            This letter was created before payment history was tracked, so earlier payments may not be recorded here.
            Record any payments already received, then confirm the history is complete to show the confirmed balance
            and status.
          </p>
          <form
            action={confirmShipperLetterPaymentHistory}
            onSubmit={(e) => {
              if (!window.confirm("Confirm that every payment received for this letter is recorded?")) e.preventDefault()
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Confirm payment history is complete
            </button>
          </form>
        </div>
      ) : null}

      {payments.length > 0 ? (
        <ul className="mt-4 flex flex-col divide-y divide-border rounded-lg border border-border">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">
                  {formatPaymentAmount(p)}
                  {p.currency === "HTG" ? (
                    <span className="font-normal text-muted-foreground"> = {usd.format(p.amount_usd)}</span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.payment_date} · {p.location} · {p.method}
                  {p.exchange_rate ? ` · Rate 1 USD = ${p.exchange_rate} HTG` : ""}
                </span>
              </div>
              <form
                action={deleteShipperLetterPayment}
                onSubmit={(e) => {
                  if (!window.confirm("Remove this payment from the history?")) e.preventDefault()
                }}
              >
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="payment_id" value={p.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No payments recorded yet.</p>
      )}

      {canRecord ? (
        <form key={formKey} action={formAction} className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
          <input type="hidden" name="id" value={id} />
          <h3 className="text-sm font-bold text-foreground">Record a payment</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay-currency" className="text-sm font-medium text-foreground">
                Currency
              </label>
              <select
                id="pay-currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as PaymentCurrency)}
                className={inputClass}
              >
                {PAYMENT_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay-location" className="text-sm font-medium text-foreground">
                Received in
              </label>
              <select id="pay-location" name="location" defaultValue="USA" className={inputClass}>
                {PAYMENT_LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {currency === "HTG" ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="pay-rate" className="text-sm font-medium text-foreground">
                  Exchange rate (HTG per 1 USD)
                </label>
                <input
                  id="pay-rate"
                  name="exchange_rate"
                  type="number"
                  inputMode="decimal"
                  min="0.0001"
                  step="0.0001"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay-amount" className="text-sm font-medium text-foreground">
                Amount received ({currency})
              </label>
              <input
                id="pay-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} text-right font-mono`}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillAmount((summary.invoiceTotal ?? 0) / 2)}
                  disabled={(summary.invoiceTotal ?? 0) / 2 > balance + 0.001}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-40"
                >
                  50% deposit
                </button>
                <button
                  type="button"
                  onClick={() => fillAmount(balance)}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary"
                >
                  Full balance
                </button>
              </div>
              {usdPreview !== null ? (
                <p className="text-xs text-muted-foreground">
                  USD equivalent: <span className="font-mono font-bold text-foreground">{usd.format(usdPreview)}</span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay-date" className="text-sm font-medium text-foreground">
                Payment date
              </label>
              <input
                id="pay-date"
                name="payment_date"
                type="date"
                required
                defaultValue={todayIso()}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pay-method" className="text-sm font-medium text-foreground">
                Method
              </label>
              <select id="pay-method" name="method" defaultValue="Cash" className={inputClass}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-apricot-light disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Record Payment
            </button>
            <p role="status" aria-live="polite" className="text-sm">
              {state.error ? (
                <span className="text-destructive">{state.error}</span>
              ) : state.savedAt && !pending ? (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" /> Payment recorded
                </span>
              ) : null}
            </p>
          </div>
        </form>
      ) : summary.invoiceTotal === null || summary.invoiceTotal <= 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Save the invoice total above before recording payments.</p>
      ) : null}
    </section>
  )
}
