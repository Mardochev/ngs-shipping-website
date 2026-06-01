"use client"

import { useState, type FormEvent } from "react"
import { Search, PackageCheck, MapPin, Truck, Plane, CheckCircle2 } from "lucide-react"

type Stage = {
  icon: typeof Truck
  title: string
  location: string
  date: string
  done: boolean
}

function buildStages(trackingId: string): Stage[] {
  return [
    {
      icon: PackageCheck,
      title: "Package received",
      location: "Pompano Beach, FL",
      date: "Processed at NGS facility",
      done: true,
    },
    {
      icon: Truck,
      title: "Departed warehouse",
      location: "Pompano Beach, FL",
      date: "Loaded for export",
      done: true,
    },
    {
      icon: Plane,
      title: "In transit to Haiti",
      location: "International freight",
      date: "On the way",
      done: true,
    },
    {
      icon: MapPin,
      title: "Out for delivery",
      location: "Port-au-Prince, Haiti",
      date: `Ref ${trackingId.toUpperCase()}`,
      done: false,
    },
  ]
}

export function TrackingForm() {
  const [value, setValue] = useState("")
  const [result, setResult] = useState<{ id: string; stages: Stage[] } | null>(null)
  const [error, setError] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Please enter a tracking number.")
      setResult(null)
      return
    }
    setError("")
    setResult({ id: trimmed, stages: buildStages(trimmed) })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
      >
        <label htmlFor="tracking" className="sr-only">
          Tracking number
        </label>
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-input bg-navy-deep px-4 py-3">
          <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            id="tracking"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter tracking number (e.g. NGS-2026-0042)"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          Track
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-apricot-light" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-1 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tracking number</p>
              <p className="font-display text-xl font-bold text-foreground">
                {result.id.toUpperCase()}
              </p>
            </div>
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary sm:mt-0">
              <Truck className="h-4 w-4" aria-hidden="true" />
              In Transit
            </span>
          </div>

          <ol className="mt-6 space-y-6">
            {result.stages.map((stage, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      stage.done
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-navy-deep text-muted-foreground"
                    }`}
                  >
                    {stage.done ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <stage.icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  {i < result.stages.length - 1 && (
                    <span
                      className={`mt-1 h-full min-h-8 w-0.5 ${stage.done ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-display font-semibold text-foreground">{stage.title}</p>
                  <p className="text-sm text-muted-foreground">{stage.location}</p>
                  <p className="text-xs text-muted-foreground">{stage.date}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 rounded-lg bg-navy-deep p-4 text-sm leading-relaxed text-muted-foreground">
            This is a sample tracking view. For real-time updates on your shipment, call us at{" "}
            <span className="font-semibold text-primary">954-939-8617</span>.
          </p>
        </div>
      )}
    </div>
  )
}
