"use client"

import { useActionState } from "react"
import { Search, Truck, CheckCircle2, MapPin, Clock } from "lucide-react"
import { lookupTracking } from "@/lib/actions/tracking"
import { StatusBadge } from "@/components/status-badge"
import { SubmitButton } from "@/components/admin/submit-button"

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDay(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function TrackingForm() {
  const [result, formAction] = useActionState(lookupTracking, null)

  return (
    <div className="mx-auto max-w-3xl">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
      >
        <label htmlFor="tracking" className="sr-only">
          Tracking number
        </label>
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-input bg-navy-deep px-4 py-3">
          <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            id="tracking"
            name="tracking"
            type="text"
            placeholder="Enter tracking number (e.g. NGS-2026-0042)"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <SubmitButton className="px-6 py-3 text-base" pendingText="Searching...">
          Track
        </SubmitButton>
      </form>

      {result && !result.found && (
        <p
          className="mt-4 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-4 py-3 text-sm text-apricot-light"
          role="alert"
        >
          {result.error}
        </p>
      )}

      {result?.found && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tracking number</p>
              <p className="font-display text-xl font-bold text-foreground">{result.tracking}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.origin} → {result.destination}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {result.status && <StatusBadge status={result.status} />}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                ETA: {formatDay(result.estimatedDelivery)}
              </p>
            </div>
          </div>

          {result.events && result.events.length > 0 ? (
            <ol className="mt-6 space-y-6">
              {result.events.map((event, i) => {
                const isLatest = i === result.events!.length - 1
                return (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isLatest
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-navy-deep text-primary"
                        }`}
                      >
                        {isLatest ? (
                          <Truck className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      {i < result.events!.length - 1 && (
                        <span className="mt-1 h-full min-h-8 w-0.5 bg-primary" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="font-display font-semibold text-foreground">{event.status}</p>
                      {event.location && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {event.location}
                        </p>
                      )}
                      {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="mt-6 rounded-lg bg-navy-deep p-4 text-sm text-muted-foreground">
              Your shipment is currently marked as <span className="font-semibold text-primary">{result.status}</span>.
              Check back soon for detailed tracking updates.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
