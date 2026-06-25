"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Plane, UserPlus, Eye, EyeOff } from "lucide-react"
import { registerCustomer } from "@/lib/actions/customer"
import { SubmitButton } from "@/components/admin/submit-button"

const inputClass =
  "rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerCustomer, {})
  const [showPassword, setShowPassword] = useState(false)

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

        {state?.error && (
          <p className="mt-6 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-4 py-3 text-sm text-apricot-light" role="alert">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="first_name" className="text-sm font-medium text-foreground">
                First name
              </label>
              <input id="first_name" name="first_name" required autoComplete="given-name" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="last_name" className="text-sm font-medium text-foreground">
                Last name
              </label>
              <input id="last_name" name="last_name" required autoComplete="family-name" className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="754-326-3413" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="flex items-center rounded-lg border border-input bg-navy-deep">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <SubmitButton className="mt-2 w-full py-3 text-base" pendingText="Creating account...">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Create Account
          </SubmitButton>
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
