"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { getServiceClient } from "@/lib/supabase/admin"
import {
  createCustomerSession,
  getCustomerSession,
  clearCustomerSession,
} from "@/lib/session"

type ActionResult = { error?: string }

function pad(num: number, len = 4) {
  return String(num).padStart(len, "0")
}

export async function registerCustomer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const firstName = String(formData.get("first_name") ?? "").trim()
  const lastName = String(formData.get("last_name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const phone = String(formData.get("phone") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm_password") ?? "")
  const preferredDestination = String(formData.get("preferred_destination") ?? "").trim()
  const allowedDestinations = ["Okay (Les Cayes)", "Okap (Cap-Ha\u00EFtien)"]

  if (!firstName || !lastName || !email) return { error: "All fields are required." }
  if (password.length < 6) return { error: "Password must be at least 6 characters." }
  if (password !== confirm) return { error: "Passwords do not match." }

  const supabase = getServiceClient()
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle()
  if (existing) return { error: "An account with this email already exists." }

  const { data: counter } = await supabase.rpc("next_counter", { counter_name: "customer" })
  const code = `NGS-CUST-${pad(Number(counter))}`
  const passwordHash = await bcrypt.hash(password, 10)

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      customer_code: code,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email,
      phone: phone || null,
      password_hash: passwordHash,
      notes: allowedDestinations.includes(preferredDestination)
        ? `Preferred destination: ${preferredDestination}`
        : null,
    })
    .select("id, customer_code, full_name, email")
    .single()
  if (error) return { error: error.message }

  await createCustomerSession({
    id: customer.id as string,
    customerCode: customer.customer_code as string,
    email: customer.email as string,
    name: customer.full_name as string,
  })
  redirect("/dashboard")
}

export async function loginCustomer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Email and password are required." }

  const supabase = getServiceClient()
  const { data: customer } = await supabase
    .from("customers")
    .select("id, customer_code, full_name, email, password_hash")
    .eq("email", email)
    .maybeSingle()

  if (!customer || !customer.password_hash) return { error: "Invalid email or password." }
  const ok = await bcrypt.compare(password, customer.password_hash as string)
  if (!ok) return { error: "Invalid email or password." }

  await createCustomerSession({
    id: customer.id as string,
    customerCode: (customer.customer_code as string) ?? "",
    email: customer.email as string,
    name: customer.full_name as string,
  })
  redirect("/dashboard")
}

export async function logoutCustomer() {
  await clearCustomerSession()
  redirect("/login")
}

export { getCustomerSession }
