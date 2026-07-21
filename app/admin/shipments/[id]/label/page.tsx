import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getShipmentForPrint } from "@/lib/queries"
import { getCachedQrDataUrl } from "@/lib/qr-cache"
import { getBarcodeSvg } from "@/lib/barcode"
import { LabelActions } from "@/components/admin/label-actions"

const company = {
  name: "NEXTLANE GLOBAL SHIPPING",
  shortName: "NGS",
  addressLines: ["83 NW 15th Pl", "Pompano Beach, FL 33060", "USA"],
  phone: "+1 (954) 939-8617",
} as const

const TRACKING_URL = "https://www.ngsshipping.com/tracking"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// Print strategy mirrors the working invoice page: hide page chrome with
// display:none (cheap) instead of toggling visibility on every DOM node, and
// avoid CSS gradients so Edge's print pipeline does not freeze.
const labelPrintCss = `
@media print {
  @page {
    size: 4in 6in;
    margin: 0;
  }
  .label-page {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
  }
  .no-print {
    display: none !important;
  }
  .shipping-label {
    width: 4in !important;
    height: 6in !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }
}
`

export default async function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const shipment = await getShipmentForPrint(id)
  if (!shipment) notFound()

  const customer = shipment.customers
  const qrDataUrl = await getCachedQrDataUrl(
    `${TRACKING_URL}?number=${encodeURIComponent(shipment.tracking_number)}`,
    { width: 220, margin: 1 },
  )
  const barcodeSvg = getBarcodeSvg(shipment.tracking_number, { height: 40 })

  return (
    <div className="label-page min-h-screen bg-navy-deep px-4 py-8 print:bg-white print:p-0">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: labelPrintCss }} />

      <div className="mx-auto max-w-md">
        <div className="no-print mb-6">
          <LabelActions />
        </div>

        {/* 4x6 shipping label */}
        <div
          className="shipping-label mx-auto flex flex-col bg-white text-black shadow-2xl"
          style={{ width: "4in", height: "6in", padding: "0.2in", fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-12 w-12 items-center justify-center rounded font-extrabold text-white"
                style={{ backgroundColor: "#0a2a4a", fontSize: "17px" }}
              >
                NGS
              </span>
              <div className="leading-tight">
                <p className="font-extrabold" style={{ fontSize: "13px", color: "#0a2a4a" }}>
                  {company.name}
                </p>
                <p style={{ fontSize: "8px" }}>Air Cargo · USA → Haiti</p>
              </div>
            </div>
            <p className="font-bold" style={{ fontSize: "9px" }}>
              {shipment.shipping_method}
            </p>
          </div>

          {/* From */}
          <div className="border-b border-black py-1.5">
            <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
              From / Sender
            </p>
            <p className="font-semibold" style={{ fontSize: "10px" }}>
              {company.shortName} — {company.addressLines.join(", ")}
            </p>
            <p style={{ fontSize: "9px" }}>{company.phone}</p>
          </div>

          {/* To */}
          <div className="border-b-2 border-black py-2">
            <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
              Ship To / Recipient
            </p>
            <p className="font-extrabold" style={{ fontSize: "15px", lineHeight: 1.2 }}>
              {shipment.recipient_name || customer?.full_name || "—"}
            </p>
            {shipment.recipient_address && (
              <p style={{ fontSize: "11px", lineHeight: 1.3 }}>{shipment.recipient_address}</p>
            )}
            <p style={{ fontSize: "11px" }}>{shipment.destination}</p>
            {shipment.recipient_phone && <p style={{ fontSize: "11px" }}>Tel: {shipment.recipient_phone}</p>}
          </div>

          {/* Details row */}
          <div className="grid grid-cols-2 gap-2 border-b border-black py-2" style={{ fontSize: "9px" }}>
            <div>
              <p className="font-bold uppercase" style={{ fontSize: "7px" }}>
                Weight
              </p>
              <p className="font-semibold" style={{ fontSize: "11px" }}>
                {shipment.weight_lb} lb
              </p>
            </div>
            <div>
              <p className="font-bold uppercase" style={{ fontSize: "7px" }}>
                Ship Date
              </p>
              <p className="font-semibold" style={{ fontSize: "11px" }}>
                {formatDate(shipment.created_at)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-bold uppercase" style={{ fontSize: "7px" }}>
                Customer
              </p>
              <p className="font-semibold" style={{ fontSize: "11px" }}>
                {customer?.full_name ?? "—"}
                {customer?.customer_code ? ` (${customer.customer_code})` : ""}
              </p>
            </div>
          </div>

          {/* Tracking + QR */}
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
                Tracking Number
              </p>
              <p className="font-mono font-extrabold" style={{ fontSize: "16px", letterSpacing: "0.5px" }}>
                {shipment.tracking_number}
              </p>
              {/* Barcode (cached inline SVG — cheap to print, never regenerated) */}
              <div
                aria-hidden="true"
                className="mt-1"
                style={{ height: "34px", width: "2in" }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl || "/placeholder.svg"} alt="Scan to track shipment" style={{ height: "1in", width: "1in" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
