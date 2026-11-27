"use client"

import { SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/types"

export function TrackingStatusSelect({
  action,
  id,
  value,
  label,
}: {
  action: (formData: FormData) => Promise<void>
  id: string
  value: ShipmentStatus | null
  label: string
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        key={value ?? "unset"}
        name="status"
        defaultValue={value ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-input bg-navy-deep px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
        aria-label={label}
      >
        {value === null && (
          <option value="" disabled>
            Not set
          </option>
        )}
        {SHIPMENT_STATUSES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </select>
    </form>
  )
}
