import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getShipmentById } from "@/lib/queries"
import { site } from "@/lib/site"
import { InvoiceActions } from "@/components/admin/invoice-actions"

export const dynamic = "force-dynamic"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const { shipment } = await getShipmentById(id)
  if (!shipment) notFound()

  const customer = shipment.customers
  const cost = Number(shipment.cost)
  const invoiceNo = `INV-${shipment.tracking_number.replace(/[^0-9A-Za-z]/g, "").slice(-8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-navy-deep px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <InvoiceActions />
        </div>

        <article className="mx-auto rounded-2xl bg-white p-8 text-slate-900 shadow-2xl print:rounded-none print:shadow-none sm:p-10">
          {/* Header */}
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                {site.shortName}
              </h1>
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#b8791a" }}>
                {site.name}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {site.address}
                <br />
                {site.phone} · {site.email}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-display text-xl font-bold text-slate-900">INVOICE</p>
              <p className="mt-1 text-sm text-slate-500">{invoiceNo}</p>
              <p className="text-sm text-slate-500">Date: {formatDate(shipment.created_at)}</p>
            </div>
          </div>

          {/* Bill to + shipment */}
          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bill to</p>
              <p className="mt-1 font-semibold text-slate-900">{customer?.full_name ?? "Walk-in customer"}</p>
              {customer?.customer_code && <p className="text-sm text-slate-500">{customer.customer_code}</p>}
              {customer?.email && <p className="text-sm text-slate-500">{customer.email}</p>}
              {customer?.phone && <p className="text-sm text-slate-500">{customer.phone}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Shipment</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{shipment.tracking_number}</p>
              <p className="text-sm text-slate-500">{shipment.origin} → {shipment.destination}</p>
              <p className="text-sm text-slate-500">Status: {shipment.status}</p>
              <p className="text-sm text-slate-500">ETA: {formatDate(shipment.estimated_delivery)}</p>
            </div>
          </div>

          {/* Recipient */}
          {(shipment.recipient_name || shipment.recipient_address) && (
            <div className="mb-6 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ship to (Haiti)</p>
              <p className="mt-1 text-sm text-slate-700">
                {shipment.recipient_name}
                {shipment.recipient_phone ? ` · ${shipment.recipient_phone}` : ""}
              </p>
              {shipment.recipient_address && <p className="text-sm text-slate-500">{shipment.recipient_address}</p>}
            </div>
          )}

          {/* Line items */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 text-center font-semibold">Method</th>
                <th className="pb-2 text-center font-semibold">Weight</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-700">
                  {shipment.description || "Air cargo shipment to Haiti"}
                </td>
                <td className="py-3 text-center text-slate-500">{shipment.shipping_method}</td>
                <td className="py-3 text-center text-slate-500">{shipment.weight_lb} lb</td>
                <td className="py-3 text-right font-semibold text-slate-900">${cost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total (USD)</span>
                <span>${cost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            Thank you for shipping with {site.name}. {site.slogan}.
          </p>
        </article>
      </div>
    </div>
  )
}
