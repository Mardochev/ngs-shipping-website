"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  type PublicCustomer,
  type RegisterInput,
} from "@/lib/auth"

type AuthContextValue = {
  customer: PublicCustomer | null
  ready: boolean
  register: (input: RegisterInput) => PublicCustomer
  login: (email: string, password: string) => PublicCustomer
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<PublicCustomer | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCustomer(getCurrentCustomer())
    setReady(true)
  }, [])

  const value: AuthContextValue = {
    customer,
    ready,
    register: (input) => {
      const c = registerCustomer(input)
      setCustomer(c)
      return c
    },
    login: (email, password) => {
      const c = loginCustomer(email, password)
      setCustomer(c)
      return c
    },
    logout: () => {
      logoutCustomer()
      setCustomer(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
