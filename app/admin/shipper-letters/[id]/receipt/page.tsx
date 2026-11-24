import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getShipperLetterById, listShipperLetterPayments } from "@/lib/shipper-letter-queries"
import { getBarcodeSvg } from "@/lib/barcode"
import {
  formatShipperAddressLines,
  computeLetterLoad,
  fixedItemCharge,
  getLetterFixedItems,
  getLetterPackages,
  summarizeLetterPayments,
} from "@/lib/shipper-letter-types"
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

// The thermal head prints black only, so strip page chrome and any
// background colors. Page size is set at print time by ThermalReceiptActions.
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
const htg = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatMoney(value: number | string | null) {
  return value === null ? "—" : usd.format(Number(value))
}

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

export default async function ShipperLetterReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const [letter, payments] = await Promise.all([getShipperLetterById(id), listShipperLetterPayments(id)])
  if (!letter) notFound()

  const packages = getLetterPackages(letter)
  const fixedItems = getLetterFixedItems(letter)
  const load = computeLetterLoad(packages, fixedItems)
  const summary = summarizeLetterPayments(
    letter.total === null ? null : Number(letter.total),
    payments,
    letter.payment_history_verified !== false,
  )

  const barcodeSvg = getBarcodeSvg(letter.reference_number, { height: 60 })
  const printedDate = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const specialInstructions = letter.special_instructions?.trim()

  return (
    <div className="receipt-page min-h-screen bg-navy-deep px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: thermalPrintCss }} />

      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="no-print">
          <ThermalReceiptActions backHref={`/admin/shipper-letters/${letter.id}`} />
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
            aria-label={`Barcode for ${letter.reference_number}`}
            className="w-full"
            style={{ height: "16mm" }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
          <PrintAirplaneIcon size={24} />
          <p className="text-center font-mono text-[16px] font-black">{letter.reference_number}</p>

          <Divider />

          <Line label="Printed" value={printedDate} />
          <Line
            label="Est. Delivery"
            value={letter.estimated_delivery_date ? formatDate(letter.estimated_delivery_date) : "—"}
          />

          <Divider />

          <Heading>From</Heading>
          <p className="font-bold">{letter.shipper_full_name}</p>
          {formatShipperAddressLines(letter).map((line) => (
            <p key={line}>{line}</p>
          ))}

          <Divider />

          <Heading>To</Heading>
          <p className="font-bold">{letter.recipient_full_name}</p>
          <p className="font-bold">{letter.destination_city}, Haiti</p>

          <Divider />

          <Heading>Packages</Heading>
          {packages.map((p, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span className="break-words">
                {i + 1}. {p.description}
              </span>
              <span className="shrink-0 font-bold">{p.weight.toFixed(2)} lb</span>
            </div>
          ))}
          {fixedItems.length > 0 ? (
            <>
              <p className="mt-1 font-black uppercase">Fixed-price items</p>
              {fixedItems.map((item, i) => (
                <div key={i} className="mt-0.5">
                  <div className="flex justify-between gap-3">
                    <span className="break-words">
                      {item.quantity} × {item.description}
                    </span>
                    <span className="shrink-0 font-bold">{usd.format(fixedItemCharge(item))}</span>
                  </div>
                  <p className="text-[12px]">
                    {usd.format(item.unit_price)} each · {item.weight.toFixed(2)} lb
                    {item.in_existing_box ? " · in box above" : " · own box"}
                  </p>
                </div>
              ))}
            </>
          ) : null}
          <Line label="Packages" value={String(load.packageCount)} />
          <Line label="Total weight" value={`${load.totalWeight.toFixed(2)} lb`} />
          {fixedItems.length > 0 ? <Line label="Per-lb weight" value={`${load.perLbWeight.toFixed(2)} lb`} /> : null}
          {specialInstructions ? <p className="mt-0.5 break-words">Note: {specialInstructions}</p> : null}

          <Divider />

          <Heading>Payment</Heading>
          <Line label={fixedItems.length > 0 ? "Per-lb packages" : "Price"} value={formatMoney(letter.price)} />
          {fixedItems.length > 0 ? <Line label="Fixed-price items" value={usd.format(load.fixedCharge)} /> : null}
          <Line label="Assurance fee" value={formatMoney(letter.fees)} />
          <div className="mt-0.5 flex justify-between gap-3 text-[16px] font-black">
            <span>INVOICE TOTAL</span>
            <span>{formatMoney(letter.total)}</span>
          </div>

          {payments.length > 0 ? (
            <>
              <Divider />
              <Heading>Payments Received</Heading>
              {payments.map((p) => (
                <div key={p.id} className="mt-0.5">
                  <Line label={`${formatDate(p.payment_date)} ${p.location}`} value={usd.format(p.amount_usd)} />
                  <p className="text-[12px]">
                    {p.method}
                    {p.currency === "HTG" ? ` · ${htg.format(p.amount)} HTG @ ${p.exchange_rate}` : ""}
                  </p>
                </div>
              ))}
            </>
          ) : null}

          <Divider />

          <Line label="Total paid" value={usd.format(summary.totalPaid)} />
          {summary.balanceConfirmed ? (
            <div className="mt-0.5 flex justify-between gap-3 text-[18px] font-black">
              <span>BALANCE DUE</span>
              <span>{summary.balanceDue === null ? "—" : usd.format(summary.balanceDue)}</span>
            </div>
          ) : null}
          <p className="text-center text-[15px] font-black uppercase">{summary.status}</p>

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
