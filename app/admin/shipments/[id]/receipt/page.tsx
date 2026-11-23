import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getShipmentForPrint } from "@/lib/queries"
import { getBarcodeSvg } from "@/lib/barcode"
import { computeInvoice } from "@/lib/invoice-lines"
import { ThermalReceiptActions } from "@/components/admin/thermal-receipt-actions"
import { PrintAirplaneIcon } from "@/components/print/print-airplane-icon"

export const dynamic = "force-dynamic"

const company = {
  shortName: "NGS",
  name: "NEXTLANE GLOBAL SHIPPING",
  website: "www.ngsshipping.com",
  phone: "+1 (754) 800-6115",
  address: "83 NW 15th Pl, Pompano Beach, FL 33060",
} as const

const TERMS = [
  "Air cargo service. Tracking number provided.",
  "Photo ID required to collect shipment.",
  "NGS is not responsible for prohibited items.",
]

// Same 80mm TM-T20II print rules as the Shipper Letter receipt.
const thermalPrintCss = `
@media print {
  @page { size: 72mm 300mm; margin: 0; }
  html, body { width: 72mm !important; margin: 0 !important; padding: 0 !important; background: #fff !important; overflow: hidden; }
  body * { background: transparent !important; box-shadow: none !important; }
  .no-print { display: none !important; }
  .receipt-page { width: 72mm !important; padding: 0 !important; min-height: 0 !important; }
  .receipt-page > div { max-width: none !important; width: 72mm !important; margin: 0 !important; gap: 0 !important; }
  .thermal-receipt { box-sizing: border-box !important; width: 72mm !important; margin: 0 auto !important; padding: 3mm 1mm !important; border: none !important; overflow: hidden; }
}
.thermal-receipt, .thermal-receipt * {
  color: #000 !important;
  border-color: #000 !important;
  opacity: 1 !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  -webkit-font-smoothing: none;
  text-rendering: geometricPrecision;
}
.thermal-receipt svg { shape-rendering: crispEdges; }
.thermal-receipt svg rect { fill: #000 !important; }
`

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function Divider() {
  return <hr className="my-1.5 border-0 border-t-[1.5px] border-dashed border-black" />
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-black uppercase leading-tight tracking-wide">{children}</h2>
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  )
}

export default async function ShipmentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const shipment = await getShipmentForPrint(id)
  if (!shipment) notFound()

  const { lines, subtotal, generalFee, insurance, total, isLegacy } = computeInvoice(shipment)
  const barcodeSvg = getBarcodeSvg(shipment.tracking_number, { height: 60 })
  const printedDate = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const sender = shipment.customers

  return (
    <div className="receipt-page min-h-screen bg-navy-deep px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: thermalPrintCss }} />

      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="no-print">
          <ThermalReceiptActions backHref={`/admin/shipments/${shipment.id}/invoice`} backLabel="Back to Invoice" />
        </div>

        <article
          className="thermal-receipt mx-auto bg-white text-[13.5px] leading-snug text-black"
          style={{ width: "80mm", padding: "3mm 4mm", fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <header className="text-center">
            <p className="text-[24px] font-black leading-none">{company.shortName}</p>
            <p className="text-[12px] font-bold">{company.name}</p>
            <p>{company.website}</p>
            <p>{company.phone}</p>
            <p>{company.address}</p>
          </header>

          <Divider />

          <div
            role="img"
            aria-label={`Barcode for ${shipment.tracking_number}`}
            className="w-full"
            style={{ height: "16mm" }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
          <PrintAirplaneIcon size={24} />
          <p className="text-center font-mono text-[16px] font-black">{shipment.tracking_number}</p>

          <Divider />

          <Line label="Printed" value={printedDate} />
          <Line label="Status" value={shipment.payment_status === "PAID" ? "PAID" : "UNPAID"} />

          <Divider />

          {sender?.full_name ? (
            <>
              <Heading>From</Heading>
              <p className="font-bold">{sender.full_name}</p>
              {sender.phone ? <p>{sender.phone}</p> : null}
              <Divider />
            </>
          ) : null}

          <Heading>To</Heading>
          <p className="font-bold">{shipment.recipient_name || "—"}</p>
          {shipment.recipient_phone ? <p>{shipment.recipient_phone}</p> : null}
          <p className="font-bold">{shipment.destination}</p>

          <Divider />

          <Heading>Packages</Heading>
          <Line label="Weight" value={`${shipment.weight_lb} lb`} />
          {lines.map((line, index) => (
            <div key={index} className="mt-1">
              <p className="break-words font-bold">{line.description}</p>
              <Line
                label={
                  line.mode === "flat"
                    ? `${line.quantity} × ${usd.format(line.unit_price)}`
                    : `${isLegacy ? shipment.weight_lb : line.weight_lb} lb × ${usd.format(line.rate_per_lb)}/lb`
                }
                value={usd.format(line.total)}
              />
            </div>
          ))}

          <Divider />

          <Heading>Payment</Heading>
          <Line label="Subtotal" value={usd.format(subtotal)} />
          <Line label="General Fee" value={usd.format(generalFee)} />
          {insurance > 0 ? <Line label="Insurance" value={usd.format(insurance)} /> : null}
          <div className="mt-0.5 flex justify-between gap-3 text-[18px] font-black">
            <span>TOTAL</span>
            <span>{usd.format(total)}</span>
          </div>

          <Divider />

          <p className="text-center">
            Thank you for choosing
            <br />
            <span className="font-bold">{company.name}</span>
          </p>

          <Divider />

          <Heading>Terms</Heading>
          <ul className="text-[12px]">
            {TERMS.map((term) => (
              <li key={term}>- {term}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}
