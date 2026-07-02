import { redirect } from "next/navigation"
import { User, Mail, BadgeCheck, Package, LogOut, Weight, CalendarDays, Clock } from "lucide-react"
import { getCustomerSession } from "@/lib/session"
import { listCustomerShipments } from "@/lib/queries"
import { TrackingForm } from "@/components/tracking-form"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default async function DashboardPage() {
  const customer = await getCustomerSession()
  if (!customer) redirect("/login")

  const shipments = await listCustomerShipments(customer.id)
  const firstName = customer.name.split(" ")[0] ?? customer.name

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Customer Dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Welcome, {firstName}</h1>
          </div>
          <a
            href="/logout"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
          >
            <LogOut className="h-4 w-4 text-primary" aria-hidden="true" />
            Log Out
          </a>
        </div>

        {/* Account details */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border/60 pb-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BadgeCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Customer ID</p>
              <p className="font-display text-xl font-bold text-primary">{customer.customerCode || "—"}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <DetailItem icon={User} label="Full name" value={customer.name} />
            <DetailItem icon={Mail} label="Email" value={customer.email} />
          </dl>
        </div>

        {/* Packages */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-foreground">Your Packages</h2>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {shipments.length} shipment{shipments.length === 1 ? "" : "s"}
            </span>
          </div>

          {shipments.length === 0 ? (
            <p className="mt-6 rounded-xl border border-border bg-navy-deep p-6 text-center text-muted-foreground">
              You don&apos;t have any shipments yet. When NGS receives a package for you, it will appear here.
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy-deep text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tracking #</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                      <th className="px-4 py-3 font-semibold">Date Received</th>
                      <th className="px-4 py-3 font-semibold">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shipments.map((pkg) => (
                      <tr key={pkg.id} className="transition-colors hover:bg-navy-deep/50">
                        <td className="px-4 py-4 font-mono font-semibold text-primary">{pkg.tracking_number}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={pkg.status} />
                        </td>
                        <td className="px-4 py-4 text-foreground">{pkg.weight_lb} lb</td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(pkg.created_at)}</td>
                        <td className="px-4 py-4 text-foreground">{formatDate(pkg.estimated_delivery)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mt-6 flex flex-col gap-4 md:hidden">
                {shipments.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl border border-border bg-navy-deep p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-semibold text-primary">{pkg.tracking_number}</span>
                      <StatusBadge status={pkg.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                        <dt className="text-muted-foreground">Weight:</dt>
                        <dd className="font-medium text-foreground">{pkg.weight_lb} lb</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                        <dt className="text-muted-foreground">Received:</dt>
                        <dd className="font-medium text-foreground">{formatDate(pkg.created_at)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                        <dt className="text-muted-foreground">ETA:</dt>
                        <dd className="font-medium text-foreground">{formatDate(pkg.estimated_delivery)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </>
          )}
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
