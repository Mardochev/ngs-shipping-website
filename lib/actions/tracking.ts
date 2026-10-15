"use server"

import { getShipmentByTracking } from "@/lib/queries"
import { getShipperLetterByReference } from "@/lib/shipper-letter-queries"

export type TrackingResult = {
  found: boolean
  tracking?: string
  status?: string
  origin?: string
  destination?: string
  estimatedDelivery?: string | null
  events?: { status: string; location: string | null; note: string | null; date: string }[]
  error?: string
}

const SHIPPER_LETTER_PUBLIC_STATUS: Record<string, string> = {
  New: "Received",
  Processing: "Processing",
  Completed: "Completed",
  Cancelled: "Cancelled",
}

export async function lookupTracking(
  _prev: TrackingResult | null,
  formData: FormData,
): Promise<TrackingResult> {
  const tracking = String(formData.get("tracking") ?? "").trim()
  if (!tracking) return { found: false, error: "Please enter a tracking number." }

  const { shipment, events } = await getShipmentByTracking(tracking)
  if (shipment) {
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

  const letter = await getShipperLetterByReference(tracking)
  if (letter) {
    const status = SHIPPER_LETTER_PUBLIC_STATUS[letter.status] ?? letter.status
    return {
      found: true,
      tracking: letter.reference_number,
      status,
      origin: "USA",
      destination: letter.destination_city ? `${letter.destination_city}, Haiti` : "Haiti",
      estimatedDelivery: letter.estimated_delivery_date,
      events: [
        {
          status: "Received",
          location: "NGS Office, USA",
          note: "Shipper Letter received by NGS NEXTLANE GLOBAL SHIPPING.",
          date: letter.created_at,
        },
        ...(status !== "Received" && letter.updated_at !== letter.created_at
          ? [{ status, location: null, note: null, date: letter.updated_at }]
          : []),
      ],
    }
  }

  return { found: false, error: `No shipment found for "${tracking}". Please check the number and try again.` }
}
