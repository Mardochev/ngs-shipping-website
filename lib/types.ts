export type ShipmentStatus = "Processing" | "In Transit" | "Delivered"

export const SHIPMENT_STATUSES: ShipmentStatus[] = ["Processing", "In Transit", "Delivered"]

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
  created_at: string
  updated_at: string
}

export type ShipmentWithCustomer = Shipment & {
  customers: Pick<Customer, "id" | "full_name" | "customer_code" | "email" | "phone"> | null
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
