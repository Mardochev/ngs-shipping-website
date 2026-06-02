"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plane, UserPlus, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(245,166,35,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join NGS to manage your shipments and track packages.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-4 py-3 text-sm text-apricot-light" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} autoComplete="given-name" />
            <Field id="lastName" label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} autoComplete="family-name" />
          </div>
          <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} autoComplete="email" />
          <Field id="phone" label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} autoComplete="tel" placeholder="754-326-3413" />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="flex items-center rounded-lg border border-input bg-navy-deep">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                autoComplete="new-password"
                className="w-full bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Field
            id="confirmPassword"
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(v) => update("confirmPassword", v)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
          >
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-apricot-light">
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </div>
  )
}
