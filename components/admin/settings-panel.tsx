"use client"

import { useActionState } from "react"
import { updateDestinationRates, updateExchangeRate } from "@/lib/actions/admin"
import { ACTIVE_DESTINATIONS, type AppSettings, type DestinationRate } from "@/lib/types"
import { SubmitButton } from "./submit-button"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function SettingsPanel({
  settings,
  destinationRates,
}: {
  settings: AppSettings
  destinationRates: DestinationRate[]
}) {
  const [state, formAction] = useActionState(updateDestinationRates, {})

  const rateMap = new Map(destinationRates.map((r) => [r.destination, Number(r.rate_per_lb)]))

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-lg font-bold text-foreground">Pricing & invoicing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set the price per pound for each destination. New shipments auto-load the matching rate, and the rate is saved
        onto each shipment so existing invoices are never changed by later price updates.
      </p>

      {state?.error && (
        <p className="mt-4 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400" role="status">
          {state.success}
        </p>
      )}

      <form action={formAction} className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        {ACTIVE_DESTINATIONS.map((d) => (
          <div key={d} className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor={`rate-${d}`}>
              {d} — Rate per pound (USD)
            </label>
            <input type="hidden" name="destination" value={d} />
            <input
              id={`rate-${d}`}
              name="rate"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={rateMap.get(d) ?? ""}
              placeholder="e.g. 4.50"
              className={inputClass}
            />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="currency">
            Currency
          </label>
          <input id="currency" name="currency" defaultValue={settings.currency} className={inputClass} />
        </div>
        <div className="flex justify-end pt-1">
          <SubmitButton pendingText="Saving...">Save rates</SubmitButton>
        </div>
      </form>

      <ExchangeRateForm htgRate={settings.htg_rate} />
    </div>
  )
}

function ExchangeRateForm({ htgRate }: { htgRate: number | null }) {
  const [state, formAction] = useActionState(updateExchangeRate, {})

  return (
    <section className="mt-8" aria-labelledby="htg-rate-heading">
      <h2 id="htg-rate-heading" className="font-display text-lg font-bold text-foreground">
        To du jour
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The USD to HTG rate prefilled on new invoices. Saved invoices keep the rate and HTG total they were saved with.
      </p>

      {state?.error && (
        <p className="mt-4 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400" role="status">
          {state.success}
        </p>
      )}

      <form action={formAction} className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="htg_rate">
            To du jour: 1 USD = ___ HTG
          </label>
          <div className="relative">
            <input
              id="htg_rate"
              name="htg_rate"
              type="number"
              step="0.0001"
              min="0.0001"
              required
              inputMode="decimal"
              defaultValue={htgRate ?? ""}
              placeholder="e.g. 131.50"
              className={`${inputClass} pr-14`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              HTG
            </span>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <SubmitButton pendingText="Saving...">Save To du jour</SubmitButton>
        </div>
      </form>
    </section>
  )
}
