"use client"

import { useActionState } from "react"
import { ShieldCheck } from "lucide-react"
import { adminLogin, bootstrapAdmin } from "@/lib/actions/admin"
import { SubmitButton } from "./submit-button"

const inputClass =
  "rounded-lg border border-input bg-navy-deep px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"

export function AdminLoginForm({ needsBootstrap }: { needsBootstrap: boolean }) {
  const action = needsBootstrap ? bootstrapAdmin : adminLogin
  const [state, formAction] = useActionState(action, {})

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          {needsBootstrap ? "Create admin account" : "Admin Login"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {needsBootstrap
            ? "No admin exists yet. Set up the first NGS administrator account."
            : "Sign in to manage NGS shipments and customers."}
        </p>
      </div>

      {state?.error && (
        <p
          className="mt-6 rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-4 py-3 text-sm text-apricot-light"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        {needsBootstrap && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input id="name" name="name" type="text" autoComplete="name" className={inputClass} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={needsBootstrap ? "new-password" : "current-password"}
            className={inputClass}
          />
        </div>
        <SubmitButton className="mt-2 w-full py-3 text-base" pendingText="Please wait...">
          {needsBootstrap ? "Create account" : "Log In"}
        </SubmitButton>
      </form>
    </div>
  )
}
