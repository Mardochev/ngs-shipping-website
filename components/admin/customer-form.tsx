"use client"

import { useActionState, useEffect } from "react"
import { createCustomer, updateCustomer } from "@/lib/actions/admin"
import { CUSTOMER_DESTINATIONS, type Customer } from "@/lib/types"
import { SubmitButton } from "./submit-button"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function CustomerForm({ customer, onDone }: { customer?: Customer; onDone: () => void }) {
  const action = customer ? updateCustomer : createCustomer
  const [state, formAction] = useActionState(action, {})

  // Preserve any legacy destination value already on the record so editing an
  // existing customer never silently drops it.
  const isLegacyDestination =
    !!customer?.destination &&
    !CUSTOMER_DESTINATIONS.includes(customer.destination as (typeof CUSTOMER_DESTINATIONS)[number])
  const destinationOptions = isLegacyDestination
    ? [customer!.destination as string, ...CUSTOMER_DESTINATIONS]
    : [...CUSTOMER_DESTINATIONS]

  useEffect(() => {
    if (state?.success) onDone()
  }, [state, onDone])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {customer && <input type="hidden" name="id" value={customer.id} />}

      {state?.error && (
        <p className="rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="first_name">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            defaultValue={customer?.first_name ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="last_name">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            defaultValue={customer?.last_name ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" defaultValue={customer?.phone ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="destination">
          Destination (Haiti)
        </label>
        <select
          id="destination"
          name="destination"
          required
          defaultValue={customer?.destination ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Chwazi destinasyon
          </option>
          {destinationOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="address">
          Address
        </label>
        <input id="address" name="address" defaultValue={customer?.address ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={2} defaultValue={customer?.notes ?? ""} className={inputClass} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
        <SubmitButton pendingText="Saving...">{customer ? "Save changes" : "Add customer"}</SubmitButton>
      </div>
    </form>
  )
}
