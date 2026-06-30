import "server-only"
import { getServiceClient } from "@/lib/supabase/admin"
import type {
  AppSettings,
  Customer,
  Shipment,
  ShipmentWithCustomer,
  TrackingEvent,
} from "@/lib/types"

export async function getAdminCount(): Promise<number> {
  const supabase = getServiceClient()
  const { count } = await supabase.from("admins").select("id", { count: "exact", head: true })
  return count ?? 0
}

export async function listShipments(): Promise<ShipmentWithCustomer[]> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("packages")
    .select(
      "*, customers ( id, full_name, customer_code, email, phone )",
    )
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as ShipmentWithCustomer[]
}

export async function listCustomers(): Promise<Customer[]> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as Customer[]
}

export async function getSettings(): Promise<AppSettings> {
  const supabase = getServiceClient()
  const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle()
  return (
    (data as unknown as AppSettings) ?? {
      id: 0,
      rate_per_lb: 3.5,
      currency: "USD",
      updated_at: new Date().toISOString(),
    }
  )
}

export async function getShipmentById(id: string): Promise<{
  shipment: ShipmentWithCustomer | null
  events: TrackingEvent[]
}> {
  const supabase = getServiceClient()
  const { data: shipment } = await supabase
    .from("packages")
    .select("*, customers ( id, full_name, customer_code, email, phone )")
    .eq("id", id)
    .maybeSingle()
  const { data: events } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("package_id", id)
    .order("created_at", { ascending: true })
  return {
    shipment: (shipment as unknown as ShipmentWithCustomer) ?? null,
    events: (events ?? []) as unknown as TrackingEvent[],
  }
}

// Lightweight: single query, no tracking events. Used by the print pages
// (invoice + label), neither of which renders the tracking timeline.
export async function getShipmentForPrint(id: string): Promise<ShipmentWithCustomer | null> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("packages")
    .select("*, customers ( id, full_name, customer_code, email, phone )")
    .eq("id", id)
    .maybeSingle()
  return (data as unknown as ShipmentWithCustomer) ?? null
}

export async function getShipmentByTracking(tracking: string): Promise<{
  shipment: Shipment | null
  events: TrackingEvent[]
}> {
  const supabase = getServiceClient()
  const { data: shipment } = await supabase
    .from("packages")
    .select("*")
    .ilike("tracking_number", tracking.trim())
    .maybeSingle()
  if (!shipment) return { shipment: null, events: [] }
  const { data: events } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("package_id", (shipment as { id: string }).id)
    .order("created_at", { ascending: true })
  return {
    shipment: shipment as unknown as Shipment,
    events: (events ?? []) as unknown as TrackingEvent[],
  }
}

export async function listCustomerShipments(customerId: string): Promise<Shipment[]> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  return (data ?? []) as unknown as Shipment[]
}
