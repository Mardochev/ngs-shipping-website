"use server"

import { revalidatePath } from "next/cache"
import { getServiceClient } from "@/lib/supabase/admin"
import { getAdminSession } from "@/lib/session"
import {
  SHIPPER_LETTER_DESTINATIONS,
  SHIPPER_LETTER_STATUSES,
  type ShipperLetterStatus,
} from "@/lib/shipper-letter-types"

export type ShipperLetterFormState = {
  error?: string
  referenceNumber?: string
}

function text(formData: FormData, key: string, max = 200) {
  return String(formData.get(key) ?? "").trim().slice(0, max)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function submitShipperLetter(
  _prev: ShipperLetterFormState,
  formData: FormData,
): Promise<ShipperLetterFormState> {
  // Honeypot: real users never fill this hidden field.
  if (text(formData, "company_website")) return { referenceNumber: "SL-SUBMITTED" }

  const values = {
    shipper_full_name: text(formData, "shipper_full_name", 120),
    shipper_phone: text(formData, "shipper_phone", 40),
    shipper_email: text(formData, "shipper_email", 160).toLowerCase(),
    shipper_street: text(formData, "shipper_street", 200),
    shipper_city: text(formData, "shipper_city", 100),
    shipper_state: text(formData, "shipper_state", 60),
    shipper_zip: text(formData, "shipper_zip", 15),
    recipient_full_name: text(formData, "recipient_full_name", 120),
    recipient_phone: text(formData, "recipient_phone", 40),
    destination_city: text(formData, "destination_city", 60),
    package_description: text(formData, "package_description", 1000),
    special_instructions: text(formData, "special_instructions", 1000) || null,
    signature: text(formData, "signature", 120),
    signed_date: text(formData, "signed_date", 10),
  }

  const required: [keyof typeof values, string][] = [
    ["shipper_full_name", "Shipper full name"],
    ["shipper_phone", "Shipper phone number"],
    ["shipper_email", "Shipper email address"],
    ["shipper_street", "Street address"],
    ["shipper_city", "City"],
    ["shipper_state", "State"],
    ["shipper_zip", "ZIP code"],
    ["recipient_full_name", "Recipient full name"],
    ["recipient_phone", "Recipient phone number"],
    ["destination_city", "Destination city"],
    ["package_description", "Package description"],
    ["signature", "Customer signature"],
    ["signed_date", "Date"],
  ]
  for (const [key, label] of required) {
    if (!values[key]) return { error: `${label} is required.` }
  }

  if (!EMAIL_RE.test(values.shipper_email)) return { error: "Please enter a valid email address." }
  if (!(SHIPPER_LETTER_DESTINATIONS as readonly string[]).includes(values.destination_city)) {
    return { error: "Please choose a valid destination city." }
  }
  if (!DATE_RE.test(values.signed_date) || Number.isNaN(Date.parse(values.signed_date))) {
    return { error: "Please enter a valid date." }
  }

  const numberOfPackages = Number(formData.get("number_of_packages"))
  const totalWeight = Number(formData.get("total_weight"))
  const declaredValue = Number(formData.get("declared_value"))

  if (!Number.isInteger(numberOfPackages) || numberOfPackages < 1 || numberOfPackages > 10000) {
    return { error: "Number of packages must be a whole number of at least 1." }
  }
  if (!Number.isFinite(totalWeight) || totalWeight <= 0 || totalWeight > 100000) {
    return { error: "Please enter a valid total weight." }
  }
  if (!Number.isFinite(declaredValue) || declaredValue < 0 || declaredValue > 10000000) {
    return { error: "Please enter a valid declared merchandise value." }
  }
  if (formData.get("agreed_terms") !== "on") {
    return { error: "You must confirm the information and agree to the Terms & Conditions." }
  }

  try {
    const supabase = getServiceClient()
    const { data: counter, error: counterError } = await supabase.rpc("next_counter", {
      counter_name: "shipper_letter",
    } as never)
    if (counterError) throw counterError

    const referenceNumber = `SL-${new Date().getFullYear()}-${String(Number(counter)).padStart(6, "0")}`

    const { error } = await supabase.from("shipper_letters").insert({
      ...values,
      reference_number: referenceNumber,
      number_of_packages: numberOfPackages,
      total_weight: Math.round(totalWeight * 100) / 100,
      declared_value: Math.round(declaredValue * 100) / 100,
      agreed_terms: true,
    })
    if (error) throw error

    revalidatePath("/admin")
    return { referenceNumber }
  } catch (err) {
    console.error("Shipper letter submission failed:", err)
    return { error: "We couldn't submit your Shipper Letter. Please try again or call (754) 800-6115." }
  }
}

export type ShipperLetterPaymentState = {
  error?: string
  savedAt?: number
}

const MAX_AMOUNT = 1_000_000

function parseAmount(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim()
  if (value === "") return 0
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > MAX_AMOUNT) return null
  return Math.round(n * 100) / 100
}

export async function updateShipperLetterPayment(
  _prev: ShipperLetterPaymentState,
  formData: FormData,
): Promise<ShipperLetterPaymentState> {
  const session = await getAdminSession()
  if (!session) return { error: "Your session has expired. Please log in again." }

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing Shipper Letter." }

  const price = parseAmount(formData.get("price"))
  const fees = parseAmount(formData.get("fees"))
  if (price === null) return { error: "Please enter a valid price." }
  if (fees === null) return { error: "Please enter valid fees." }

  // Total is always recomputed on the server; any client-sent total is ignored.
  const total = Math.round((price + fees) * 100) / 100

  const supabase = getServiceClient()
  const { error } = await supabase
    .from("shipper_letters")
    .update({ price, fees, total, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Saving shipper letter payment failed:", error)
    return { error: "We couldn't save the payment. Please try again." }
  }

  revalidatePath(`/admin/shipper-letters/${id}`)
  return { savedAt: Date.now() }
}

export type ShipperLetterDeliveryState = {
  error?: string
  savedAt?: number
}

export async function updateShipperLetterDeliveryDate(
  _prev: ShipperLetterDeliveryState,
  formData: FormData,
): Promise<ShipperLetterDeliveryState> {
  const session = await getAdminSession()
  if (!session) return { error: "Your session has expired. Please log in again." }

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing Shipper Letter." }

  const raw = String(formData.get("estimated_delivery_date") ?? "").trim()
  if (raw && (!DATE_RE.test(raw) || Number.isNaN(Date.parse(raw)))) {
    return { error: "Please choose a valid date." }
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from("shipper_letters")
    .update({ estimated_delivery_date: raw || null, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Saving estimated delivery date failed:", error)
    return { error: "We couldn't save the date. Please try again." }
  }

  revalidatePath(`/admin/shipper-letters/${id}`)
  return { savedAt: Date.now() }
}

export async function updateShipperLetterStatus(formData: FormData): Promise<void> {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorized")

  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as ShipperLetterStatus
  if (!id || !SHIPPER_LETTER_STATUSES.includes(status)) return

  const supabase = getServiceClient()
  await supabase
    .from("shipper_letters")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  revalidatePath("/admin")
  revalidatePath(`/admin/shipper-letters/${id}`)
}
