"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, Send } from "lucide-react"

const services = [
  "Ocean Freight",
  "Air Freight",
  "Barrel Shipping",
  "Vehicle Shipping",
  "Package Delivery",
  "Other",
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-foreground">Message sent!</h3>
        <p className="mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
          Thank you for reaching out to NEXTLANE GLOBAL SHIPPING. Our team will get back to you
          shortly. For urgent requests, call us at 954-939-8617.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Jean Baptiste"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="954-000-0000"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="you@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="service" className="mb-2 block text-sm font-medium text-foreground">
            Service needed
          </label>
          <select
            id="service"
            name="service"
            className="w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            defaultValue=""
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Tell us what you'd like to ship to Haiti..."
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light sm:w-auto"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
        Send Message
      </button>
    </form>
  )
}
