export type ShipmentStatus =
  | "Processing"
  | "In Transit"
  | "Delivered"
  | "Ready for Shipment"
  | "Manifested"
  | "Departed USA"
  | "Arrived Haiti"
  | "Ready for Pickup"

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "Processing",
  "In Transit",
  "Delivered",
  "Ready for Shipment",
  "Manifested",
  "Departed USA",
  "Arrived Haiti",
  "Ready for Pickup",
]

// Statuses that make a package eligible to be added to a new manifest.
export const MANIFEST_ELIGIBLE_STATUSES: ShipmentStatus[] = ["Processing", "Ready for Shipment"]

export type ManifestStatus = "Draft" | "Manifested" | "Departed USA" | "Arrived Haiti" | "Closed"

export const MANIFEST_STATUSES: ManifestStatus[] = [
  "Draft",
  "Manifested",
  "Departed USA",
  "Arrived Haiti",
  "Closed",
]

// Maps a manifest status to the package status its members should cascade to.
export const MANIFEST_TO_PACKAGE_STATUS: Record<ManifestStatus, ShipmentStatus> = {
  Draft: "Ready for Shipment",
  Manifested: "Manifested",
  "Departed USA": "Departed USA",
  "Arrived Haiti": "Arrived Haiti",
  Closed: "Ready for Pickup",
}

// The two currently-active shipping destinations. Used by the shipment form,
// the manifest builder, and manifest validation so everything stays in sync.
export const ACTIVE_DESTINATIONS = ["Les Cayes (Okay)", "Cap-Ha\u00EFtien (Okap)"] as const

export const MANIFEST_DESTINATIONS = ACTIVE_DESTINATIONS

export type Customer = {
  id: string
  customer_code: string | null
  first_name: string | null
  last_name: string | null
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export type Shipment = {
  id: string
  tracking_number: string
  customer_id: string | null
  description: string | null
  shipping_method: string
  weight_lb: number
  cost: number
  status: ShipmentStatus
  origin: string
  destination: string
  recipient_name: string | null
  recipient_phone: string | null
  recipient_address: string | null
  estimated_delivery: string | null
  payment_status: "PAID" | "UNPAID"
  due_date: string | null
  quantity: number
  declared_value: number
  manifest_id: string | null
  created_at: string
  updated_at: string
}

export type ShipmentWithCustomer = Shipment & {
  customers: Pick<Customer, "id" | "full_name" | "customer_code" | "email" | "phone"> | null
}

export type Manifest = {
  id: string
  manifest_number: string
  destination: string
  shipment_date: string | null
  carrier: string | null
  flight_number: string | null
  status: ManifestStatus
  total_packages: number
  total_weight: number
  total_declared_value: number
  created_at: string
  updated_at: string
}

export type ManifestWithPackages = Manifest & {
  packages: ShipmentWithCustomer[]
}

export type TrackingEvent = {
  id: string
  package_id: string
  status: string
  location: string | null
  note: string | null
  created_at: string
}

export type AppSettings = {
  id: number
  rate_per_lb: number
  currency: string
  updated_at: string
}
