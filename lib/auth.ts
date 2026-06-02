export type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  createdAt: string
}

export type PublicCustomer = Omit<Customer, "password">

const USERS_KEY = "ngs_customers"
const SESSION_KEY = "ngs_session"
const COUNTER_KEY = "ngs_customer_counter"

function readUsers(): Customer[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as Customer[]
  } catch {
    return []
  }
}

function writeUsers(users: Customer[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function nextCustomerId(): string {
  const current = Number.parseInt(localStorage.getItem(COUNTER_KEY) ?? "0", 10) || 0
  const next = current + 1
  localStorage.setItem(COUNTER_KEY, String(next))
  return `NGS-CUST-${String(next).padStart(4, "0")}`
}

function toPublic(customer: Customer): PublicCustomer {
  const { password: _password, ...rest } = customer
  return rest
}

export type RegisterInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export function registerCustomer(input: RegisterInput): PublicCustomer {
  const users = readUsers()
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists.")
  }
  const customer: Customer = {
    id: nextCustomerId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  }
  users.push(customer)
  writeUsers(users)
  localStorage.setItem(SESSION_KEY, customer.id)
  return toPublic(customer)
}

export function loginCustomer(email: string, password: string): PublicCustomer {
  const users = readUsers()
  const found = users.find((u) => u.email === email.trim().toLowerCase())
  if (!found || found.password !== password) {
    throw new Error("Invalid email or password.")
  }
  localStorage.setItem(SESSION_KEY, found.id)
  return toPublic(found)
}

export function logoutCustomer() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentCustomer(): PublicCustomer | null {
  if (typeof window === "undefined") return null
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  const found = readUsers().find((u) => u.id === id)
  return found ? toPublic(found) : null
}
