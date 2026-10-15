import "server-only"
import { getServiceClient } from "@/lib/supabase/admin"
import type { ShipperLetter } from "@/lib/shipper-letter-types"

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

export async function getShipperLetterById(id: string): Promise<ShipperLetter | null> {
  const supabase = getServiceClient()
  const { data } = await supabase.from("shipper_letters").select("*").eq("id", id).maybeSingle()
  return (data as ShipperLetter | null) ?? null
}
