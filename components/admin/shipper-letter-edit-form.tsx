"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { updateShipperLetter, type ShipperLetterEditState } from "@/lib/actions/shipper-letters"
import { SHIPPER_LETTER_DESTINATIONS, type ShipperLetter } from "@/lib/shipper-letter-types"

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground [color-scheme:dark] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"

function Field({
  id,
  label,
  required,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <legend className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">{title}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

export function ShipperLetterEditForm({ letter }: { letter: ShipperLetter }) {
  const [state, formAction, pending] = useActionState<ShipperLetterEditState, FormData>(updateShipperLetter, {})

  const cities = (SHIPPER_LETTER_DESTINATIONS as readonly string[]).includes(letter.destination_city)
    ? [...SHIPPER_LETTER_DESTINATIONS]
    : [letter.destination_city, ...SHIPPER_LETTER_DESTINATIONS]

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={letter.id} />

      <Section title="Shipper Information">
        <Field id="shipper_full_name" label="Full Name" required>
          <input id="shipper_full_name" name="shipper_full_name" required maxLength={120} defaultValue={letter.shipper_full_name} className={inputClass} />
        </Field>
        <Field id="shipper_phone" label="Phone Number" required>
          <input id="shipper_phone" name="shipper_phone" type="tel" required maxLength={40} defaultValue={letter.shipper_phone} className={inputClass} />
        </Field>
        <Field id="shipper_email" label="Email (optional)" className="sm:col-span-2">
          <input id="shipper_email" name="shipper_email" type="email" maxLength={200} defaultValue={letter.shipper_email} className={inputClass} />
        </Field>
        <Field id="shipper_street" label="Street Address" className="sm:col-span-2">
          <input id="shipper_street" name="shipper_street" maxLength={200} defaultValue={letter.shipper_street} className={inputClass} />
        </Field>
        <Field id="shipper_city" label="City">
          <input id="shipper_city" name="shipper_city" maxLength={100} defaultValue={letter.shipper_city} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="shipper_state" label="State">
            <input id="shipper_state" name="shipper_state" maxLength={40} defaultValue={letter.shipper_state} className={inputClass} />
          </Field>
          <Field id="shipper_zip" label="ZIP">
            <input id="shipper_zip" name="shipper_zip" maxLength={20} defaultValue={letter.shipper_zip} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Recipient Information in Haiti">
        <Field id="recipient_full_name" label="Full Name" required>
          <input id="recipient_full_name" name="recipient_full_name" required maxLength={120} defaultValue={letter.recipient_full_name} className={inputClass} />
        </Field>
        <Field id="recipient_phone" label="Phone Number" required>
          <input id="recipient_phone" name="recipient_phone" type="tel" required maxLength={40} defaultValue={letter.recipient_phone} className={inputClass} />
        </Field>
        <Field id="destination_city" label="Destination City" required className="sm:col-span-2">
          <select id="destination_city" name="destination_city" required defaultValue={letter.destination_city} className={inputClass}>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Package Information">
        <Field id="package_description" label="Package Description" required className="sm:col-span-2">
          <textarea id="package_description" name="package_description" required rows={3} maxLength={1000} defaultValue={letter.package_description} className={inputClass} />
        </Field>
        <Field id="number_of_packages" label="Number of Packages" required>
          <input id="number_of_packages" name="number_of_packages" type="number" required min={1} step={1} defaultValue={letter.number_of_packages} className={inputClass} />
        </Field>
        <Field id="total_weight" label="Total Weight (lbs)" required>
          <input id="total_weight" name="total_weight" type="number" required min="0.01" step="0.01" inputMode="decimal" defaultValue={Number(letter.total_weight)} className={inputClass} />
        </Field>
        <Field id="declared_value" label="Declared Merchandise Value ($)" required className="sm:col-span-2">
          <input id="declared_value" name="declared_value" type="number" required min="0" step="0.01" inputMode="decimal" defaultValue={Number(letter.declared_value)} className={inputClass} />
        </Field>
        <Field id="special_instructions" label="Special Instructions" className="sm:col-span-2">
          <textarea id="special_instructions" name="special_instructions" rows={2} maxLength={1000} defaultValue={letter.special_instructions ?? ""} className={inputClass} />
        </Field>
      </Section>

      <Section title="Agreement">
        <Field id="signature" label="Customer Signature" required>
          <input id="signature" name="signature" required maxLength={120} defaultValue={letter.signature} className={inputClass} />
        </Field>
        <Field id="signed_date" label="Date" required>
          <input id="signed_date" name="signed_date" type="date" required defaultValue={letter.signed_date} className={inputClass} />
        </Field>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-apricot-light disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Save
        </button>
        <Link
          href={`/admin/shipper-letters/${letter.id}`}
          aria-disabled={pending}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </Link>
        <p role="status" aria-live="polite" className="text-sm">
          {state.error ? <span className="text-destructive">{state.error}</span> : null}
        </p>
      </div>
    </form>
  )
}
