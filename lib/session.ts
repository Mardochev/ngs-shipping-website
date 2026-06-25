import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "ngs-dev-secret",
)

const ADMIN_COOKIE = "ngs_admin_session"
const CUSTOMER_COOKIE = "ngs_customer_session"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type AdminSession = { id: string; email: string; name: string | null }
export type CustomerSession = { id: string; customerCode: string; email: string; name: string }

async function sign(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret)
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as T
  } catch {
    return null
  }
}

// ---------- Admin ----------
export async function createAdminSession(session: AdminSession) {
  const token = await sign({ ...session, role: "admin" })
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const payload = await verify<AdminSession & { role: string }>(store.get(ADMIN_COOKIE)?.value)
  if (!payload || payload.role !== "admin") return null
  return { id: payload.id, email: payload.email, name: payload.name ?? null }
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

// ---------- Customer ----------
export async function createCustomerSession(session: CustomerSession) {
  const token = await sign({ ...session, role: "customer" })
  const store = await cookies()
  store.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  })
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies()
  const payload = await verify<CustomerSession & { role: string }>(store.get(CUSTOMER_COOKIE)?.value)
  if (!payload || payload.role !== "customer") return null
  return {
    id: payload.id,
    customerCode: payload.customerCode,
    email: payload.email,
    name: payload.name,
  }
}

export async function clearCustomerSession() {
  const store = await cookies()
  store.delete(CUSTOMER_COOKIE)
}
