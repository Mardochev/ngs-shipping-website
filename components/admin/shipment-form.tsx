"use client"

import { useActionState, useEffect } from "react"
import { createShipment, updateShipment } from "@/lib/actions/admin"
import { ACTIVE_DESTINATIONS, SHIPMENT_STATUSES, type Customer, type Shipment } from "@/lib/types"
import { SubmitButton } from "./submit-button"

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function ShipmentForm({
  customers,
  shipment,
  onDone,
}: {
  customers: Customer[]
  shipment?: Shipment
  onDone: () => void
}) {
  const action = shipment ? updateShipment : createShipment
  const [state, formAction] = useActionState(action, {})

  // Existing records keep their stored destination (even legacy values) unless
  // an admin changes it here; new shipments default to Les Cayes (Okay).
  const isLegacyDestination =
    !!shipment?.destination &&
    !ACTIVE_DESTINATIONS.includes(shipment.destination as (typeof ACTIVE_DESTINATIONS)[number])
  const destinationOptions = isLegacyDestination
    ? [shipment!.destination, ...ACTIVE_DESTINATIONS]
    : [...ACTIVE_DESTINATIONS]

  useEffect(() => {
    if (state?.success) onDone()
  }, [state, onDone])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {shipment && <input type="hidden" name="id" value={shipment.id} />}

      {state?.error && (
        <p className="rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="customer_id">
            Customer
          </label>
          <select
            id="customer_id"
            name="customer_id"
            defaultValue={shipment?.customer_id ?? ""}
            className={inputClass}
          >
            <option value="">— Unassigned —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} {c.customer_code ? `(${c.customer_code})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="tracking_number">
            Tracking number
          </label>
          <input
            id="tracking_number"
            name="tracking_number"
            defaultValue={shipment?.tracking_number ?? ""}
            placeholder={shipment ? "" : "Auto-generated if blank"}
            disabled={!!shipment}
            className={`${inputClass} disabled:opacity-60`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <input
          id="description"
          name="description"
          defaultValue={shipment?.description ?? ""}
          placeholder="e.g. 2 boxes of clothing and electronics"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="weight_lb">
            Weight (lb)
          </label>
          <input
            id="weight_lb"
            name="weight_lb"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={shipment?.weight_lb ?? ""}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="cost">
            Cost (USD)
          </label>
          <input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            min="0"
            defaultValue={shipment?.cost ?? ""}
            placeholder={shipment ? "" : "Auto from rate"}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={shipment?.status ?? "Processing"} className={inputClass}>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="declared_value">
            Declared Value / Vale Machandiz
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              id="declared_value"
              name="declared_value"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              defaultValue={shipment?.declared_value ?? 0}
              placeholder="250.00"
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="quantity">
            Quantity (pieces)
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="1"
            min="1"
            defaultValue={shipment?.quantity ?? 1}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="shipping_method">
            Shipping method
          </label>
          <input
            id="shipping_method"
            name="shipping_method"
            defaultValue={shipment?.shipping_method ?? "Air Cargo"}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="estimated_delivery">
            Estimated delivery
          </label>
          <input
            id="estimated_delivery"
            name="estimated_delivery"
            type="date"
            defaultValue={shipment?.estimated_delivery ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="origin">
            Origin
          </label>
          <input id="origin" name="origin" defaultValue={shipment?.origin ?? "Florida, USA"} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="destination">
            Destination
          </label>
          <select
            id="destination"
            name="destination"
            required
            defaultValue={shipment?.destination ?? "Les Cayes (Okay)"}
            className={inputClass}
          >
            {destinationOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recipient (in Haiti)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="recipient_name"
            defaultValue={shipment?.recipient_name ?? ""}
            placeholder="Recipient name"
            className={inputClass}
          />
          <input
            name="recipient_phone"
            defaultValue={shipment?.recipient_phone ?? ""}
            placeholder="Recipient phone"
            className={inputClass}
          />
        </div>
        <input
          name="recipient_address"
          defaultValue={shipment?.recipient_address ?? ""}
          placeholder="Recipient address"
          className={`${inputClass} mt-4`}
        />
      </fieldset>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
        <SubmitButton pendingText="Saving...">{shipment ? "Save changes" : "Create shipment"}</SubmitButton>
      </div>
    </form>
  )
}
