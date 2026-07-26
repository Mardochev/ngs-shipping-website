"use client"

import { useState } from "react"
import { Package, Users, Settings, LogOut, Plane, LayoutDashboard, Truck, PackageCheck, ClipboardList } from "lucide-react"
import { adminLogout } from "@/lib/actions/admin"
import type { AppSettings, Customer, Manifest, ShipmentWithCustomer } from "@/lib/types"
import { ShipmentsPanel } from "./shipments-panel"
import { CustomersPanel } from "./customers-panel"
import { SettingsPanel } from "./settings-panel"
import { ManifestsPanel } from "./manifests-panel"

type Tab = "overview" | "shipments" | "manifests" | "customers" | "settings"

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "manifests", label: "Manifests", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
]

export function AdminDashboard({
  adminName,
  shipments,
  customers,
  settings,
  manifests,
  eligiblePackages,
}: {
  adminName: string
  shipments: ShipmentWithCustomer[]
  customers: Customer[]
  settings: AppSettings
  manifests: Manifest[]
  eligiblePackages: ShipmentWithCustomer[]
}) {
  const [tab, setTab] = useState<Tab>("overview")

  const inTransit = shipments.filter((s) => s.status === "In Transit").length
  const delivered = shipments.filter((s) => s.status === "Delivered").length
  const processing = shipments.filter((s) => s.status === "Processing").length

  const stats = [
    { label: "Total shipments", value: shipments.length, icon: Package },
    { label: "Processing", value: processing, icon: Package },
    { label: "In transit", value: inTransit, icon: Truck },
    { label: "Delivered", value: delivered, icon: PackageCheck },
    { label: "Customers", value: customers.length, icon: Users },
  ]

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <div className="leading-none">
              <p className="font-display text-base font-extrabold text-foreground">NGS Admin</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                NEXTLANE GLOBAL SHIPPING
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {adminName}
            </span>
            <form action={adminLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-8">
          {tab === "overview" && (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-3 font-display text-3xl font-extrabold text-foreground">{s.value}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-bold text-foreground">Recent shipments</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="pb-2 font-semibold">Tracking #</th>
                        <th className="pb-2 font-semibold">Customer</th>
                        <th className="pb-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {shipments.slice(0, 5).map((s) => (
                        <tr key={s.id}>
                          <td className="py-2.5 font-mono text-xs text-foreground">{s.tracking_number}</td>
                          <td className="py-2.5 text-muted-foreground">{s.customers?.full_name ?? "Unassigned"}</td>
                          <td className="py-2.5 text-muted-foreground">{s.status}</td>
                        </tr>
                      ))}
                      {shipments.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-muted-foreground">
                            No shipments yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "shipments" && <ShipmentsPanel shipments={shipments} customers={customers} />}
          {tab === "manifests" && (
            <ManifestsPanel manifests={manifests} eligiblePackages={eligiblePackages} />
          )}
          {tab === "customers" && <CustomersPanel customers={customers} />}
          {tab === "settings" && <SettingsPanel settings={settings} />}
        </div>
      </div>
    </div>
  )
}
