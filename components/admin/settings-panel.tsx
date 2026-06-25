"use client"

import { useActionState } from "react"
import { updateSettings } from "@/lib/actions/admin"
import type { AppSettings } from "@/lib/types"
import { SubmitButton } from "./submit-button"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function SettingsPanel({ settings }: { settings: AppSettings }) {
  const [state, formAction] = useActionState(updateSettings, {})

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-lg font-bold text-foreground">Pricing & invoicing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The rate per pound is used to auto-calculate shipment cost and appears on invoices.
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
          <label className={labelClass} htmlFor="rate_per_lb">
            Rate per pound (USD)
          </label>
          <input
            id="rate_per_lb"
            name="rate_per_lb"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={settings.rate_per_lb}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="currency">
            Currency
          </label>
          <input id="currency" name="currency" defaultValue={settings.currency} className={inputClass} />
        </div>
        <div className="flex justify-end pt-1">
          <SubmitButton pendingText="Saving...">Save settings</SubmitButton>
        </div>
      </form>
    </div>
  )
}
