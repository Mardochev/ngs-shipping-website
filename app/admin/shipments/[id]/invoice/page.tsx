import { notFound, redirect } from "next/navigation"
import { Plane } from "lucide-react"
import { getAdminSession } from "@/lib/session"
import { getShipmentForPrint } from "@/lib/queries"
import { getCachedQrDataUrl } from "@/lib/qr-cache"
import { InvoiceActions } from "@/components/admin/invoice-actions"

// Invoice-specific company details (provided by NGS)
const company = {
  shortName: "NGS",
  name: "NEXTLANE GLOBAL SHIPPING",
  addressLines: ["83 NW 15th Pl", "Pompano Beach, FL 33060", "USA"],
  phone: "+1 (954) 939-8617",
  email: "info@ngsshipping.com",
  website: "www.ngsshipping.com",
} as const

const NAVY = "#0a2a4a"
const GOLD = "#b8791a"
const TRACKING_URL = "https://www.ngsshipping.com/tracking"

// Keep the invoice on a single Letter page: neutralize the screen-only
// min-height/margins and prevent any page breaks inside the invoice.
const invoicePrintCss = `
@media print {
  @page {
    size: letter;
    margin: 0.3in;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  .invoice-page {
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
  }
  .invoice-article {
    break-inside: avoid;
    page-break-inside: avoid;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .no-print {
    display: none !important;
  }
}
`

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function addDays(value: string, days: number) {
  const d = new Date(value)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const shipment = await getShipmentForPrint(id)
  if (!shipment) notFound()

  const customer = shipment.customers
  const cost = Number(shipment.cost)
  const invoiceNo = `INV-${shipment.tracking_number.replace(/[^0-9A-Za-z]/g, "").slice(-8).toUpperCase()}`
  const paymentStatus = shipment.payment_status ?? "UNPAID"
  const isPaid = paymentStatus === "PAID"
  const dueDate = shipment.due_date ?? addDays(shipment.created_at, 7)

  const qrDataUrl = await getCachedQrDataUrl(TRACKING_URL, {
    width: 200,
    margin: 1,
    dark: NAVY,
    light: "#ffffff",
  })

  return (
    <div className="invoice-page min-h-screen bg-navy-deep px-4 py-8 print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{ __html: invoicePrintCss }} />
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-6">
          <InvoiceActions shipmentId={shipment.id} paymentStatus={paymentStatus} />
        </div>

        <article className="invoice-article mx-auto overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl print:rounded-none print:shadow-none">
          {/* Top accent bar */}
          <div className="h-2 w-full" style={{ backgroundColor: NAVY }}>
            <div className="h-full w-1/3" style={{ backgroundColor: GOLD }} />
          </div>

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: NAVY }}
                  aria-hidden="true"
                >
                  <Plane className="h-7 w-7" style={{ color: GOLD }} />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight" style={{ color: NAVY }}>
                    {company.shortName}
                  </h1>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: GOLD }}>
                    {company.name}
                  </p>
                  <address className="mt-2 text-xs not-italic leading-relaxed text-slate-500">
                    {company.addressLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                    {company.phone}
                    <br />
                    {company.email} · {company.website}
                  </address>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="font-display text-2xl font-extrabold" style={{ color: NAVY }}>
                  INVOICE
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{invoiceNo}</p>
                <p className="text-sm text-slate-500">Issued: {formatDate(shipment.created_at)}</p>
                <p className="text-sm text-slate-500">Due: {formatDate(dueDate)}</p>
                {/* Payment status stamp */}
                <span
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-md border-2 px-3 py-1 text-sm font-extrabold uppercase tracking-widest ${
                    isPaid ? "border-emerald-600 text-emerald-600" : "border-red-600 text-red-600"
                  }`}
                >
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>

            {/* Bill to + shipment */}
            <div className="grid gap-6 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                  Bill to
                </p>
                <p className="mt-1 font-semibold text-slate-900">{customer?.full_name ?? "Walk-in customer"}</p>
                {customer?.customer_code && <p className="text-sm text-slate-500">{customer.customer_code}</p>}
                {customer?.email && <p className="text-sm text-slate-500">{customer.email}</p>}
                {customer?.phone && <p className="text-sm text-slate-500">{customer.phone}</p>}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                  Shipment
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{shipment.tracking_number}</p>
                <p className="text-sm text-slate-500">
                  {shipment.origin} → {shipment.destination}
                </p>
                <p className="text-sm text-slate-500">Status: {shipment.status}</p>
                <p className="text-sm text-slate-500">ETA: {formatDate(shipment.estimated_delivery)}</p>
              </div>
            </div>

            {/* Recipient */}
            {(shipment.recipient_name || shipment.recipient_address) && (
              <div className="mb-6 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                  Ship to (Haiti)
                </p>
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
                <tr className="text-xs uppercase tracking-wide text-white" style={{ backgroundColor: NAVY }}>
                  <th className="rounded-l-md px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 text-center font-semibold">Method</th>
                  <th className="px-3 py-2 text-center font-semibold">Weight</th>
                  <th className="rounded-r-md px-3 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-700">{shipment.description || "Air cargo shipment to Haiti"}</td>
                  <td className="px-3 py-3 text-center text-slate-500">{shipment.shipping_method}</td>
                  <td className="px-3 py-3 text-center text-slate-500">{shipment.weight_lb} lb</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">${cost.toFixed(2)}</td>
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
                <div
                  className="flex justify-between rounded-md px-3 py-2 text-base font-bold text-white"
                  style={{ backgroundColor: NAVY }}
                >
                  <span>Total (USD)</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms + QR */}
            <div className="mt-8 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                  Terms &amp; Conditions
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-500">
                  <li>• Air Cargo Service.</li>
                  <li>• Tracking number provided.</li>
                  <li>• Customer must present ID when collecting shipment.</li>
                  <li>• NEXTLANE GLOBAL SHIPPING is not responsible for prohibited items.</li>
                </ul>
              </div>
              <div className="flex flex-col items-center gap-1 sm:items-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl || "/placeholder.svg"} alt="Scan to track your shipment" className="h-28 w-28" />
                <p className="text-center text-[10px] leading-tight text-slate-400 sm:text-right">
                  Scan to track
                  <br />
                  your shipment
                </p>
              </div>
            </div>

            <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
              Thank you for shipping with {company.name}. Your Cargo, Our Priority.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
