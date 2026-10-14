"use client"

import { useActionState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import {
  updateShipperLetterDeliveryDate,
  type ShipperLetterDeliveryState,
} from "@/lib/actions/shipper-letters"

export function ShipperLetterDeliveryForm({ id, date }: { id: string; date: string | null }) {
  const [state, formAction, pending] = useActionState<ShipperLetterDeliveryState, FormData>(
    updateShipperLetterDeliveryDate,
    {},
  )

  return (
    <section aria-labelledby="delivery-heading" className="no-print mb-6 rounded-xl border border-border bg-card p-5">
      <h2 id="delivery-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
        Delivery
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Staff only. Leave empty if not yet known.</p>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="id" value={id} />
        <div className="flex min-w-48 flex-1 flex-col gap-1.5 sm:max-w-xs">
          <label htmlFor="estimated-delivery-date" className="text-sm font-medium text-foreground">
            Estimated Delivery Date
          </label>
          <input
            id="estimated-delivery-date"
            name="estimated_delivery_date"
            type="date"
            defaultValue={date ?? ""}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground [color-scheme:dark] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-apricot-light disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Save Date
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state.error ? (
            <span className="text-destructive">{state.error}</span>
          ) : state.savedAt && !pending ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" /> Date saved
            </span>
          ) : null}
        </p>
      </form>
    </section>
  )
}
