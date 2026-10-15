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

// The currently-active shipping destinations. Used by the shipment form,
// the manifest builder, and manifest validation so everything stays in sync.
export const ACTIVE_DESTINATIONS = [
  "Les Cayes, Haiti",
  "Cap-Ha\u00EFtien, Haiti",
  "Port-au-Prince, Haiti",
] as const

export const MANIFEST_DESTINATIONS = ACTIVE_DESTINATIONS

// Destination options offered to customers at registration and on their admin
// profile. Same canonical list as ACTIVE_DESTINATIONS so everything stays in sync.
export const CUSTOMER_DESTINATIONS = ACTIVE_DESTINATIONS

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
  destination: string | null
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
  rate_per_lb: number | null
  general_fee: number
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

// Flat per-shipment fee charged separately from Weight × Rate.
export const DEFAULT_GENERAL_FEE = 8.5

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

// A Shipper Letter as it appears on a manifest. Linked through the
// manifest_shipper_letters table so the letter record itself is never copied
// into packages or modified.
export type ManifestLetter = {
  id: string
  reference_number: string
  shipper_full_name: string
  recipient_full_name: string
  recipient_phone: string
  destination_city: string
  package_description: string
  number_of_packages: number
  total_weight: number
  declared_value: number
  status: string
}

export const MANIFEST_LETTER_COLUMNS =
  "id, reference_number, shipper_full_name, recipient_full_name, recipient_phone, destination_city, package_description, number_of_packages, total_weight, declared_value, status"

// Shipper Letters can be added to a manifest while they are still open.
export const MANIFEST_ELIGIBLE_LETTER_STATUSES = ["New", "Processing"] as const

// Shipper Letters store the bare city ("Les Cayes") while manifests use the
// full destination ("Les Cayes, Haiti").
export function letterMatchesDestination(city: string, destination: string) {
  const norm = (s: string) => s.normalize("NFC").trim().toLowerCase()
  return norm(destination.split(",")[0] ?? "") === norm(city)
}

export type ManifestWithPackages = Manifest & {
  packages: ShipmentWithCustomer[]
  letters: ManifestLetter[]
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

// Admin-configured price per pound for a specific destination. The shipment
// form auto-loads the matching rate; the value is then frozen onto each
// shipment so historical invoices are unaffected by later price changes.
export type DestinationRate = {
  destination: string
  rate_per_lb: number
  currency: string
  updated_at: string
}
