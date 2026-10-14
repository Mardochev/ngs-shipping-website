"use client"

import { useActionState, useState, type ReactNode } from "react"
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react"
import { submitShipperLetter, type ShipperLetterFormState } from "@/lib/actions/shipper-letters"
import { SHIPPER_LETTER_DESTINATIONS } from "@/lib/shipper-letter-types"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"

function Field({
  id,
  label,
  className = "",
  children,
}: {
  id: string
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-primary">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function todayIso() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

export function ShipperLetterForm() {
  const [state, formAction, pending] = useActionState<ShipperLetterFormState, FormData>(
    submitShipperLetter,
    {},
  )
  const [formKey, setFormKey] = useState(0)
  const [dismissedRef, setDismissedRef] = useState<string | null>(null)

  if (state.referenceNumber && state.referenceNumber !== dismissedRef) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-foreground">Shipper Letter submitted</h2>
        <p className="mt-2 text-muted-foreground">Your reference number is</p>
        <p className="mt-2 rounded-lg border border-primary/40 bg-navy-deep px-5 py-3 font-mono text-2xl font-bold tracking-wider text-primary">
          {state.referenceNumber}
        </p>
        <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
          Please show this reference number to NGS staff when you drop off your packages.
        </p>
        <button
          type="button"
          onClick={() => {
            setDismissedRef(state.referenceNumber ?? null)
            setFormKey((k) => k + 1)
          }}
          className="mt-8 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
        >
          Submit another Shipper Letter
        </button>
      </div>
    )
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-6">
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Section title="Sender Information">
        <Field id="shipper_full_name" label="Full Name">
          <input id="shipper_full_name" name="shipper_full_name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field id="shipper_phone" label="Phone Number">
          <input id="shipper_phone" name="shipper_phone" type="tel" inputMode="tel" required autoComplete="tel" className={inputClass} />
        </Field>
      </Section>

      <Section title="Recipient Information in Haiti">
        <Field id="recipient_full_name" label="Full Name" className="sm:col-span-2">
          <input id="recipient_full_name" name="recipient_full_name" required className={inputClass} />
        </Field>
        <Field id="recipient_phone" label="Phone Number">
          <input id="recipient_phone" name="recipient_phone" type="tel" inputMode="tel" required className={inputClass} />
        </Field>
        <Field id="destination_city" label="City">
          <select id="destination_city" name="destination_city" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a city
            </option>
            {SHIPPER_LETTER_DESTINATIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Package Information">
        <Field id="package_description" label="Package Description" className="sm:col-span-2">
          <textarea id="package_description" name="package_description" rows={3} required className={inputClass} />
        </Field>
        <Field id="number_of_packages" label="Number of Packages">
          <input id="number_of_packages" name="number_of_packages" type="number" inputMode="numeric" min={1} step={1} required defaultValue={1} className={inputClass} />
        </Field>
        <Field id="total_weight" label="Total Weight (lbs)">
          <input id="total_weight" name="total_weight" type="number" inputMode="decimal" min={0.01} step="0.01" required className={inputClass} />
        </Field>
        <Field id="declared_value" label="Declared Merchandise Value (USD)" className="sm:col-span-2">
          <input id="declared_value" name="declared_value" type="number" inputMode="decimal" min={0} step="0.01" required className={inputClass} />
        </Field>
      </Section>

      <Section title="Confirmation">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:col-span-2">
          By signing, I confirm that the information provided is correct and I agree to NGS NEXTLANE GLOBAL SHIPPING
          Terms &amp; Conditions.
        </p>
        <Field id="signature" label="Signature (type your full name)">
          <input id="signature" name="signature" required className={`${inputClass} font-display italic`} />
        </Field>
        <Field id="signed_date" label="Date">
          <input id="signed_date" name="signed_date" type="date" required defaultValue={todayIso()} className={inputClass} />
        </Field>
      </Section>

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-5 font-display text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-apricot-light disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-6 w-6" aria-hidden="true" />
        )}
        {pending ? "Submitting..." : "Submit Shipper Letter"}
      </button>
    </form>
  )
}
