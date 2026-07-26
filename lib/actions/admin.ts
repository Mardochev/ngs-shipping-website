"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { getServiceClient } from "@/lib/supabase/admin"
import {
  createAdminSession,
  getAdminSession,
  clearAdminSession,
} from "@/lib/session"
import { SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/types"

type ActionResult = { error?: string; success?: string }

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

function pad(num: number, len = 4) {
  return String(num).padStart(len, "0")
}

async function nextCode(name: "customer" | "tracking") {
  const supabase = getServiceClient()
  const { data, error } = await supabase.rpc("next_counter", { counter_name: name } as never)
  if (error) throw error
  return Number(data)
}

// ---------------- Admin auth ----------------
export async function adminLogin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Email and password are required." }

  const supabase = getServiceClient()
  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, name, password_hash")
    .eq("email", email)
    .maybeSingle()

  if (!admin) return { error: "Invalid email or password." }
  const ok = await bcrypt.compare(password, admin.password_hash as string)
  if (!ok) return { error: "Invalid email or password." }

  await createAdminSession({
    id: admin.id as string,
    email: admin.email as string,
    name: (admin.name as string) ?? null,
  })
  redirect("/admin")
}

export async function adminLogout() {
  await clearAdminSession()
  redirect("/admin/login")
}

// Bootstrap the first admin when none exist yet.
export async function bootstrapAdmin(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = getServiceClient()
  const { count } = await supabase.from("admins").select("id", { count: "exact", head: true })
  if ((count ?? 0) > 0) return { error: "An admin account already exists. Please log in." }

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Email and password are required." }
  if (password.length < 8) return { error: "Password must be at least 8 characters." }

  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from("admins")
    .insert({ email, password_hash, name: name || null })
    .select("id, email, name")
    .single()
  if (error) return { error: error.message }

  await createAdminSession({
    id: data.id as string,
    email: data.email as string,
    name: (data.name as string) ?? null,
  })
  redirect("/admin")
}

// ---------------- Customers ----------------
export async function createCustomer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const firstName = String(formData.get("first_name") ?? "").trim()
  const lastName = String(formData.get("last_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const phone = String(formData.get("phone") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()

  if (!firstName || !lastName) return { error: "First and last name are required." }

  const fullName = `${firstName} ${lastName}`.trim()
  const code = `NGS-CUST-${pad(await nextCode("customer"))}`

  const { error } = await supabase.from("customers").insert({
    customer_code: code,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: email || null,
    phone: phone || null,
    address: address || null,
    notes: notes || null,
  })
  if (error) return { error: error.message }

  revalidatePath("/admin")
  return { success: `Customer ${code} created.` }
}

export async function updateCustomer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const id = String(formData.get("id") ?? "")
  const firstName = String(formData.get("first_name") ?? "").trim()
  const lastName = String(formData.get("last_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const phone = String(formData.get("phone") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()
  if (!id) return { error: "Missing customer id." }

  const { error } = await supabase
    .from("customers")
    .update({
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin")
  return { success: "Customer updated." }
}

export async function deleteCustomer(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const id = String(formData.get("id") ?? "")
  if (id) {
    await supabase.from("customers").delete().eq("id", id)
    revalidatePath("/admin")
  }
}

// ---------------- Shipments ----------------
export async function createShipment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const customerId = String(formData.get("customer_id") ?? "")
  const description = String(formData.get("description") ?? "").trim()
  const shippingMethod = String(formData.get("shipping_method") ?? "Air Cargo").trim()
  const weight = Number.parseFloat(String(formData.get("weight_lb") ?? "0")) || 0
  const status = (String(formData.get("status") ?? "Processing") as ShipmentStatus)
  const origin = String(formData.get("origin") ?? "Florida, USA").trim()
  const destination = String(formData.get("destination") ?? "Port-au-Prince, Haiti").trim()
  const recipientName = String(formData.get("recipient_name") ?? "").trim()
  const recipientPhone = String(formData.get("recipient_phone") ?? "").trim()
  const recipientAddress = String(formData.get("recipient_address") ?? "").trim()
  const eta = String(formData.get("estimated_delivery") ?? "").trim()
  let tracking = String(formData.get("tracking_number") ?? "").trim().toUpperCase()
  const costInput = String(formData.get("cost") ?? "").trim()
  const quantity = Math.max(1, Math.round(Number.parseFloat(String(formData.get("quantity") ?? "1")) || 1))
  const declaredValue = Math.max(0, Number.parseFloat(String(formData.get("declared_value") ?? "0")) || 0)

  if (!SHIPMENT_STATUSES.includes(status)) return { error: "Invalid status." }
  if (weight <= 0) return { error: "Weight must be greater than zero." }

  // Auto-generate tracking number if not provided
  if (!tracking) {
    const year = new Date().getFullYear()
    tracking = `NGS-${year}-${pad(await nextCode("tracking"))}`
  }

  // Compute cost from rate if not provided
  let cost = Number.parseFloat(costInput)
  if (!costInput || Number.isNaN(cost)) {
    const { data: settings } = await supabase
      .from("app_settings")
      .select("rate_per_lb")
      .limit(1)
      .maybeSingle()
    const rate = Number(settings?.rate_per_lb ?? 3.5)
    cost = Math.round(rate * weight * 100) / 100
  }

  const { data: pkg, error } = await supabase
    .from("packages")
    .insert({
      tracking_number: tracking,
      customer_id: customerId || null,
      description: description || null,
      shipping_method: shippingMethod,
      weight_lb: weight,
      cost,
      status,
      origin,
      destination,
      recipient_name: recipientName || null,
      recipient_phone: recipientPhone || null,
      recipient_address: recipientAddress || null,
      estimated_delivery: eta || null,
      quantity,
      declared_value: declaredValue,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }

  await supabase.from("tracking_events").insert({
    package_id: pkg.id,
    status,
    location: origin,
    note: "Shipment created",
  })

  revalidatePath("/admin")
  return { success: `Shipment ${tracking} created.` }
}

export async function updateShipment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing shipment id." }
  const description = String(formData.get("description") ?? "").trim()
  const shippingMethod = String(formData.get("shipping_method") ?? "Air Cargo").trim()
  const weight = Number.parseFloat(String(formData.get("weight_lb") ?? "0")) || 0
  const cost = Number.parseFloat(String(formData.get("cost") ?? "0")) || 0
  const status = String(formData.get("status") ?? "Processing") as ShipmentStatus
  const origin = String(formData.get("origin") ?? "").trim()
  const destination = String(formData.get("destination") ?? "").trim()
  const recipientName = String(formData.get("recipient_name") ?? "").trim()
  const recipientPhone = String(formData.get("recipient_phone") ?? "").trim()
  const recipientAddress = String(formData.get("recipient_address") ?? "").trim()
  const eta = String(formData.get("estimated_delivery") ?? "").trim()
  const customerId = String(formData.get("customer_id") ?? "")
  const quantity = Math.max(1, Math.round(Number.parseFloat(String(formData.get("quantity") ?? "1")) || 1))
  const declaredValue = Math.max(0, Number.parseFloat(String(formData.get("declared_value") ?? "0")) || 0)

  if (!SHIPMENT_STATUSES.includes(status)) return { error: "Invalid status." }

  const { error } = await supabase
    .from("packages")
    .update({
      customer_id: customerId || null,
      description: description || null,
      shipping_method: shippingMethod,
      weight_lb: weight,
      cost,
      status,
      origin,
      destination,
      recipient_name: recipientName || null,
      recipient_phone: recipientPhone || null,
      recipient_address: recipientAddress || null,
      estimated_delivery: eta || null,
      quantity,
      declared_value: declaredValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin")
  return { success: "Shipment updated." }
}

export async function updateShipmentStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as ShipmentStatus
  const location = String(formData.get("location") ?? "").trim()
  if (!id || !SHIPMENT_STATUSES.includes(status)) return

  await supabase
    .from("packages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
  await supabase.from("tracking_events").insert({
    package_id: id,
    status,
    location: location || null,
    note: `Status updated to ${status}`,
  })
  revalidatePath("/admin")
}

export async function setPaymentStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const id = String(formData.get("id") ?? "")
  const paymentStatus = String(formData.get("payment_status") ?? "")
  if (!id || !["PAID", "UNPAID"].includes(paymentStatus)) return

  await supabase
    .from("packages")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
  revalidatePath(`/admin/shipments/${id}/invoice`)
  revalidatePath("/admin")
}

export async function deleteShipment(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const id = String(formData.get("id") ?? "")
  if (id) {
    await supabase.from("packages").delete().eq("id", id)
    revalidatePath("/admin")
  }
}

// ---------------- Settings ----------------
export async function updateSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()
  const rate = Number.parseFloat(String(formData.get("rate_per_lb") ?? "0")) || 0
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD"

  const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle()
  if (existing) {
    await supabase
      .from("app_settings")
      .update({ rate_per_lb: rate, currency, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
  } else {
    await supabase.from("app_settings").insert({ rate_per_lb: rate, currency })
  }
  revalidatePath("/admin")
  return { success: "Settings saved." }
}
