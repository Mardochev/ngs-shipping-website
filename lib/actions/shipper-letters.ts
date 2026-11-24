"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServiceClient } from "@/lib/supabase/admin"
import { getAdminSession } from "@/lib/session"
import {
  MAX_LETTER_PACKAGES,
  PAYMENT_CURRENCIES,
  PAYMENT_LOCATIONS,
  PAYMENT_METHODS,
  SHIPPER_LETTER_DESTINATIONS,
  SHIPPER_LETTER_STATUSES,
  sumPackageWeight,
  summarizeLetterPayments,
  type PaymentCurrency,
  type PaymentLocation,
  type ShipperLetterPackage,
  type ShipperLetterStatus,
} from "@/lib/shipper-letter-types"

export type ShipperLetterFormState = {
  error?: string
  referenceNumber?: string
}

function text(formData: FormData, key: string, max = 200) {
  return String(formData.get(key) ?? "").trim().slice(0, max)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Package rows are the source of truth; the combined count, weight and description
// columns are derived from them so the Manifest and older screens keep working.
function parsePackages(raw: FormDataEntryValue | null) {
  let input: unknown
  try {
    input = JSON.parse(String(raw ?? "[]"))
  } catch {
    return { error: "Please check the package list and try again." }
  }
  if (!Array.isArray(input) || input.length === 0) return { error: "Add at least one package." }
  if (input.length > MAX_LETTER_PACKAGES) return { error: `A Shipper Letter can list up to ${MAX_LETTER_PACKAGES} packages.` }

  const packages: ShipperLetterPackage[] = []
  for (const [index, row] of input.entries()) {
    const description = String((row as { description?: unknown })?.description ?? "").trim().slice(0, 200)
    const weight = Number((row as { weight?: unknown })?.weight)
    if (!description) return { error: `Package ${index + 1}: description is required.` }
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100000) {
      return { error: `Package ${index + 1}: please enter a valid weight in lbs.` }
    }
    packages.push({ description, weight: Math.round(weight * 100) / 100 })
  }

  return {
    columns: {
      packages,
      number_of_packages: packages.length,
      total_weight: sumPackageWeight(packages),
      package_description: packages
        .map((p) => p.description)
        .join(", ")
        .slice(0, 1000),
    },
  }
}

export async function submitShipperLetter(
  _prev: ShipperLetterFormState,
  formData: FormData,
): Promise<ShipperLetterFormState> {
  // Honeypot: real users never fill this hidden field.
  if (text(formData, "company_website")) return { referenceNumber: "NGS-SUBMITTED" }

  const values = {
    shipper_full_name: text(formData, "shipper_full_name", 120),
    shipper_phone: text(formData, "shipper_phone", 40),
    shipper_email: text(formData, "shipper_email", 200),
    recipient_full_name: text(formData, "recipient_full_name", 120),
    recipient_phone: text(formData, "recipient_phone", 40),
    destination_city: text(formData, "destination_city", 60),
    signature: text(formData, "signature", 120),
    signed_date: text(formData, "signed_date", 10),
  }

  const required: [keyof typeof values, string][] = [
    ["shipper_full_name", "Sender full name"],
    ["shipper_phone", "Sender phone number"],
    ["recipient_full_name", "Recipient full name"],
    ["recipient_phone", "Recipient phone number"],
    ["destination_city", "City"],
    ["signature", "Signature"],
    ["signed_date", "Date"],
  ]
  for (const [key, label] of required) {
    if (!values[key]) return { error: `${label} is required.` }
  }

  if (!(SHIPPER_LETTER_DESTINATIONS as readonly string[]).includes(values.destination_city)) {
    return { error: "Please choose a valid destination city." }
  }
  if (values.shipper_email && !EMAIL_RE.test(values.shipper_email)) {
    return { error: "Please enter a valid email address." }
  }
  if (!DATE_RE.test(values.signed_date) || Number.isNaN(Date.parse(values.signed_date))) {
    return { error: "Please enter a valid date." }
  }

  const parsedPackages = parsePackages(formData.get("packages"))
  if ("error" in parsedPackages) return { error: parsedPackages.error }
  const declaredValue = Number(formData.get("declared_value"))

  if (!Number.isFinite(declaredValue) || declaredValue < 0 || declaredValue > 10000000) {
    return { error: "Please enter a valid declared merchandise value." }
  }

  try {
    const supabase = getServiceClient()
    const { data: counter, error: counterError } = await supabase.rpc("next_counter", {
      counter_name: "shipper_letter",
    } as never)
    if (counterError) throw counterError

    const referenceNumber = `NGS-${new Date().getFullYear()}-${String(Number(counter)).padStart(6, "0")}`

    const { error } = await supabase.from("shipper_letters").insert({
      ...values,
      // Columns kept for older letters; the simplified form no longer collects them.
      shipper_street: "",
      shipper_city: "",
      shipper_state: "",
      shipper_zip: "",
      special_instructions: null,
      reference_number: referenceNumber,
      ...parsedPackages.columns,
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

export type ShipperLetterEditState = {
  error?: string
}

export async function updateShipperLetter(
  _prev: ShipperLetterEditState,
  formData: FormData,
): Promise<ShipperLetterEditState> {
  const session = await getAdminSession()
  if (!session) return { error: "Your session has expired. Please log in again." }

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing Shipper Letter." }

  const values = {
    shipper_full_name: text(formData, "shipper_full_name", 120),
    shipper_phone: text(formData, "shipper_phone", 40),
    shipper_email: text(formData, "shipper_email", 200),
    shipper_street: text(formData, "shipper_street", 200),
    shipper_city: text(formData, "shipper_city", 100),
    shipper_state: text(formData, "shipper_state", 40),
    shipper_zip: text(formData, "shipper_zip", 20),
    recipient_full_name: text(formData, "recipient_full_name", 120),
    recipient_phone: text(formData, "recipient_phone", 40),
    destination_city: text(formData, "destination_city", 60),
    signature: text(formData, "signature", 120),
    signed_date: text(formData, "signed_date", 10),
  }

  const required: [keyof typeof values, string][] = [
    ["shipper_full_name", "Sender full name"],
    ["shipper_phone", "Sender phone number"],
    ["recipient_full_name", "Recipient full name"],
    ["recipient_phone", "Recipient phone number"],
    ["destination_city", "City"],
    ["signature", "Signature"],
    ["signed_date", "Date"],
  ]
  for (const [key, label] of required) {
    if (!values[key]) return { error: `${label} is required.` }
  }

  if (values.shipper_email && !EMAIL_RE.test(values.shipper_email)) {
    return { error: "Please enter a valid email address." }
  }
  if (!DATE_RE.test(values.signed_date) || Number.isNaN(Date.parse(values.signed_date))) {
    return { error: "Please enter a valid date." }
  }

  const parsedPackages = parsePackages(formData.get("packages"))
  if ("error" in parsedPackages) return { error: parsedPackages.error }
  const declaredValue = Number(formData.get("declared_value"))

  if (!Number.isFinite(declaredValue) || declaredValue < 0 || declaredValue > 10000000) {
    return { error: "Please enter a valid declared merchandise value." }
  }

  const supabase = getServiceClient()
  const { data: existing, error: fetchError } = await supabase
    .from("shipper_letters")
    .select("destination_city")
    .eq("id", id)
    .maybeSingle()
  if (fetchError || !existing) return { error: "This Shipper Letter could not be found." }

  // Older letters may carry a city that is no longer offered; keep accepting it.
  const allowedCities = [...SHIPPER_LETTER_DESTINATIONS, (existing as { destination_city: string }).destination_city]
  if (!allowedCities.includes(values.destination_city)) {
    return { error: "Please choose a valid destination city." }
  }

  const specialInstructions = text(formData, "special_instructions", 1000)

  // reference_number, status, payment and delivery fields are intentionally not touched here.
  const { error } = await supabase
    .from("shipper_letters")
    .update({
      ...values,
      special_instructions: specialInstructions || null,
      ...parsedPackages.columns,
      declared_value: Math.round(declaredValue * 100) / 100,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Updating shipper letter failed:", error)
    return { error: "We couldn't save your changes. Please try again." }
  }

  revalidatePath("/admin", "layout")
  redirect(`/admin/shipper-letters/${id}`)
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
  if (fees === null) return { error: "Please enter a valid assurance fee." }

  // Total is always recomputed on the server; any client-sent total is ignored.
  const total = Math.round((price + fees) * 100) / 100

  const supabase = getServiceClient()
  const { data: received } = await supabase
    .from("shipper_letter_payments")
    .select("amount_usd")
    .eq("shipper_letter_id", id)
  const { totalPaid } = summarizeLetterPayments(null, (received ?? []) as { amount_usd: number }[])
  if (total < totalPaid) {
    return { error: `The total can't be less than the ${totalPaid.toFixed(2)} USD already received.` }
  }

  const { error } = await supabase
    .from("shipper_letters")
    .update({ price, fees, total, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Saving shipper letter payment failed:", error)
    return { error: "We couldn't save the invoice total. Please try again." }
  }

  revalidatePath(`/admin/shipper-letters/${id}`)
  return { savedAt: Date.now() }
}

export type RecordLetterPaymentState = {
  error?: string
  savedAt?: number
}

export async function recordShipperLetterPayment(
  _prev: RecordLetterPaymentState,
  formData: FormData,
): Promise<RecordLetterPaymentState> {
  const session = await getAdminSession()
  if (!session) return { error: "Your session has expired. Please log in again." }

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing Shipper Letter." }

  const currency = String(formData.get("currency") ?? "") as PaymentCurrency
  const location = String(formData.get("location") ?? "") as PaymentLocation
  const method = String(formData.get("method") ?? "")
  const paymentDate = String(formData.get("payment_date") ?? "").trim()
  const amountRaw = Number(String(formData.get("amount") ?? "").trim())

  if (!PAYMENT_CURRENCIES.includes(currency)) return { error: "Choose USD or HTG." }
  if (!PAYMENT_LOCATIONS.includes(location)) return { error: "Choose where the payment was received." }
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) return { error: "Choose a payment method." }
  if (!DATE_RE.test(paymentDate) || Number.isNaN(Date.parse(paymentDate))) {
    return { error: "Please enter a valid payment date." }
  }
  const maxAmount = currency === "HTG" ? MAX_AMOUNT * 1000 : MAX_AMOUNT
  if (!Number.isFinite(amountRaw) || amountRaw <= 0 || amountRaw > maxAmount) {
    return { error: "Please enter the amount received." }
  }
  const amount = Math.round(amountRaw * 100) / 100

  let exchangeRate: number | null = null
  let amountUsd = amount
  if (currency === "HTG") {
    const rate = Number(String(formData.get("exchange_rate") ?? "").trim())
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
      return { error: "Enter the exchange rate used (HTG per 1 USD)." }
    }
    exchangeRate = Math.round(rate * 10000) / 10000
    amountUsd = Math.round((amount / exchangeRate) * 100) / 100
    if (amountUsd <= 0) return { error: "This HTG amount is too small at that exchange rate." }
  }

  const supabase = getServiceClient()
  const [{ data: letter }, { data: received }] = await Promise.all([
    supabase.from("shipper_letters").select("total").eq("id", id).maybeSingle(),
    supabase.from("shipper_letter_payments").select("amount_usd").eq("shipper_letter_id", id),
  ])
  if (!letter) return { error: "This Shipper Letter could not be found." }

  const { invoiceTotal, balanceDue } = summarizeLetterPayments(
    (letter as { total: number | null }).total,
    (received ?? []) as { amount_usd: number }[],
  )
  if (invoiceTotal === null || invoiceTotal <= 0) {
    return { error: "Save the invoice total before recording payments." }
  }
  if (balanceDue === 0) return { error: "This Shipper Letter is already paid in full." }
  if (balanceDue !== null && amountUsd > balanceDue + 0.01) {
    return { error: `This payment (${amountUsd.toFixed(2)} USD) is more than the ${balanceDue.toFixed(2)} USD balance due.` }
  }

  const { error } = await supabase.from("shipper_letter_payments").insert({
    shipper_letter_id: id,
    amount,
    currency,
    location,
    payment_date: paymentDate,
    method,
    exchange_rate: exchangeRate,
    // A payment that settles the balance within rounding is recorded as the exact balance.
    amount_usd: balanceDue !== null && amountUsd > balanceDue ? balanceDue : amountUsd,
  })
  if (error) {
    console.error("Recording shipper letter payment failed:", error)
    return { error: "We couldn't record the payment. Please try again." }
  }

  await supabase.from("shipper_letters").update({ updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath(`/admin/shipper-letters/${id}`)
  revalidatePath("/admin")
  return { savedAt: Date.now() }
}

export async function deleteShipperLetterPayment(formData: FormData): Promise<void> {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorized")

  const id = String(formData.get("id") ?? "")
  const paymentId = String(formData.get("payment_id") ?? "")
  if (!id || !paymentId) return

  const supabase = getServiceClient()
  await supabase.from("shipper_letter_payments").delete().eq("id", paymentId).eq("shipper_letter_id", id)
  revalidatePath(`/admin/shipper-letters/${id}`)
  revalidatePath("/admin")
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
