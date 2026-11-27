import "server-only"
import { getServiceClient } from "@/lib/supabase/admin"
import type { ShipperLetter, ShipperLetterPayment } from "@/lib/shipper-letter-types"

export async function listShipperLetterPayments(letterId: string): Promise<ShipperLetterPayment[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("shipper_letter_payments")
    .select("*")
    .eq("shipper_letter_id", letterId)
    .order("payment_date", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) {
    console.error("Failed to load shipper letter payments:", error.message)
    return []
  }
  return (data ?? []).map((p) => ({
    ...(p as ShipperLetterPayment),
    amount: Number((p as ShipperLetterPayment).amount),
    amount_usd: Number((p as ShipperLetterPayment).amount_usd),
    exchange_rate:
      (p as ShipperLetterPayment).exchange_rate === null ? null : Number((p as ShipperLetterPayment).exchange_rate),
  }))
}

export async function listShipperLetters(): Promise<ShipperLetter[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("shipper_letters")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Failed to load shipper letters:", error.message)
    return []
  }
  return (data ?? []) as ShipperLetter[]
}

export async function getShipperLetterByReference(reference: string): Promise<ShipperLetter | null> {
  const normalized = reference.trim()
  if (!normalized) return null
  const pattern = normalized.replace(/[\\%_]/g, (c) => `\\${c}`)
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("shipper_letters")
    .select("*")
    .ilike("reference_number", pattern)
    .maybeSingle()
  return (data as ShipperLetter | null) ?? null
}

export async function getShipperLetterTrackingEvents(
  letterId: string,
): Promise<{ status: string; location: string | null; note: string | null; created_at: string }[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("tracking_events")
    .select("status, location, note, created_at")
    .eq("shipper_letter_id", letterId)
    .order("created_at", { ascending: true })
  if (error) {
    console.error("Failed to load shipper letter tracking events:", error.message)
    return []
  }
  return data ?? []
}

export async function getShipperLetterById(id: string): Promise<ShipperLetter | null> {
  const supabase = getServiceClient()
  const { data } = await supabase.from("shipper_letters").select("*").eq("id", id).maybeSingle()
  return (data as ShipperLetter | null) ?? null
}
