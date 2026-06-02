"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Package,
  LogOut,
  PackageOpen,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { TrackingForm } from "@/components/tracking-form"

export default function DashboardPage() {
  const router = useRouter()
  const { customer, ready, logout } = useAuth()

  useEffect(() => {
    if (ready && !customer) {
      router.replace("/login")
    }
  }, [ready, customer, router])

  if (!ready || !customer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  const fullName = `${customer.firstName} ${customer.lastName}`

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Customer Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
              Welcome, {customer.firstName}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
          >
            <LogOut className="h-4 w-4 text-primary" aria-hidden="true" />
            Log Out
          </button>
        </div>

        {/* Account details */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border/60 pb-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BadgeCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Customer ID</p>
              <p className="font-display text-xl font-bold text-primary">{customer.id}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            <DetailItem icon={User} label="Full name" value={fullName} />
            <DetailItem icon={Mail} label="Email" value={customer.email} />
            <DetailItem icon={Phone} label="Phone" value={customer.phone} />
          </dl>
        </div>

        {/* Packages */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-foreground">Your Packages</h2>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-navy-deep px-6 py-12 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-display font-semibold text-foreground">No packages yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Once you ship with NGS, your packages and their delivery status will appear here.
            </p>
          </div>
        </div>

        {/* Tracking search */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-foreground">Track a Shipment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your tracking number to see the latest status.
          </p>
          <div className="mt-6">
            <TrackingForm />
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="truncate font-medium text-foreground">{value}</dd>
      </div>
    </div>
  )
}
