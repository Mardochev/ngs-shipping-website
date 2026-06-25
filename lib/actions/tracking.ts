"use server"

import { getShipmentByTracking } from "@/lib/queries"
import type { ShipmentStatus } from "@/lib/types"

export type TrackingResult = {
  found: boolean
  tracking?: string
  status?: ShipmentStatus
  origin?: string
  destination?: string
  estimatedDelivery?: string | null
  events?: { status: string; location: string | null; note: string | null; date: string }[]
  error?: string
}

export async function lookupTracking(
  _prev: TrackingResult | null,
  formData: FormData,
): Promise<TrackingResult> {
  const tracking = String(formData.get("tracking") ?? "").trim()
  if (!tracking) return { found: false, error: "Please enter a tracking number." }

  const { shipment, events } = await getShipmentByTracking(tracking)
  if (!shipment) {
    return { found: false, error: `No shipment found for "${tracking}". Please check the number and try again.` }
  }

  return {
    found: true,
    tracking: shipment.tracking_number,
    status: shipment.status,
    origin: shipment.origin,
    destination: shipment.destination,
    estimatedDelivery: shipment.estimated_delivery,
    events: events.map((e) => ({
      status: e.status,
      location: e.location,
      note: e.note,
      date: e.created_at,
    })),
  }
}
