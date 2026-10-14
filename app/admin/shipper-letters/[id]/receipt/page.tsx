import { notFound, redirect } from "next/navigation"
import { Plane } from "lucide-react"
import { getAdminSession } from "@/lib/session"
import { getShipperLetterById } from "@/lib/shipper-letter-queries"
import { getBarcodeSvg } from "@/lib/barcode"
import { ThermalReceiptActions } from "@/components/admin/thermal-receipt-actions"

export const dynamic = "force-dynamic"

const company = {
  shortName: "NGS",
  name: "NEXTLANE GLOBAL SHIPPING",
  website: "www.ngsshipping.com",
  phone: "+1 (754) 800-6115",
  address: "83 NW 15th Pl, Pompano Beach, FL 33060",
} as const

const TERMS = [
  "Air Cargo Service.",
  "Tracking number provided.",
  "Customer must present ID when collecting shipment.",
  "NEXTLANE GLOBAL SHIPPING is not responsible for prohibited items.",
]

// The thermal head prints black only, so strip page chrome and any
// background colors. Page size is set at print time by ThermalReceiptActions.
const thermalPrintCss = `
@media print {
  @page { size: 80mm 300mm; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body * { background: transparent !important; box-shadow: none !important; }
  .no-print { display: none !important; }
  .receipt-page { padding: 0 !important; min-height: 0 !important; }
  .thermal-receipt { width: 80mm !important; margin: 0 !important; border: none !important; }
  .receipt-section { break-inside: avoid; page-break-inside: avoid; }
}
`

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

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

function Divider({ heavy = false }: { heavy?: boolean }) {
  return <hr className={heavy ? "my-2 border-t-2 border-black" : "my-2 border-t border-dashed border-black"} />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] font-extrabold uppercase tracking-wider">{children}</h2>
}

function Line({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-[12px] leading-snug">
      <span className="shrink-0">{label}</span>
      <span className={`text-right ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[12px] leading-snug">
      <p className="text-[10px] font-bold uppercase">{label}</p>
      <p className="whitespace-pre-line break-words">{value || "—"}</p>
    </div>
  )
}

export default async function ShipperLetterReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const letter = await getShipperLetterById(id)
  if (!letter) notFound()

  const barcodeSvg = getBarcodeSvg(letter.reference_number, { height: 60 })
  const printedDate = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="receipt-page min-h-screen bg-navy-deep px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: thermalPrintCss }} />

      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="no-print">
          <ThermalReceiptActions backHref={`/admin/shipper-letters/${letter.id}`} />
        </div>

        <article
          className="thermal-receipt mx-auto bg-white text-black shadow-2xl"
          style={{ width: "80mm", padding: "4mm", fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <header className="receipt-section flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded border-2 border-black">
                <Plane className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[30px] font-black leading-none tracking-wide">{company.shortName}</span>
            </div>
            <p className="mt-1.5 text-[13px] font-extrabold uppercase leading-tight">{company.name}</p>
            <p className="mt-1 text-[12px]">{company.website}</p>
            <p className="text-[12px]">{company.phone}</p>
            <p className="text-[12px] leading-snug">{company.address}</p>
          </header>

          <Divider heavy />

          <section className="receipt-section flex flex-col items-center">
            <div
              role="img"
              aria-label={`Barcode for ${letter.reference_number}`}
              className="w-full px-1"
              style={{ height: "18mm" }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider">Tracking / Reference Number</p>
            <p className="font-mono text-[18px] font-extrabold tracking-wide">{letter.reference_number}</p>
          </section>

          <Divider />

          <section className="receipt-section flex flex-col gap-0.5">
            <Line label="Printed Date" value={printedDate} />
            <Line
              label="Est. Delivery Date"
              value={letter.estimated_delivery_date ? formatDate(letter.estimated_delivery_date) : "—"}
              bold
            />
            <Line label="Status" value={letter.status} bold />
          </section>

          <Divider heavy />

          <section className="receipt-section flex flex-col gap-1.5">
            <SectionTitle>From / Shipper</SectionTitle>
            <Field label="Full Name" value={letter.shipper_full_name} />
            <Field label="Phone Number" value={letter.shipper_phone} />
            <Field
              label="Address"
              value={`${letter.shipper_street}\n${letter.shipper_city}, ${letter.shipper_state} ${letter.shipper_zip}`}
            />
          </section>

          <Divider />

          <section className="receipt-section flex flex-col gap-1.5">
            <SectionTitle>To / Recipient</SectionTitle>
            <Field label="Full Name" value={letter.recipient_full_name} />
            <Field label="Phone Number" value={letter.recipient_phone} />
            <Field label="Destination City" value={letter.destination_city} />
          </section>

          <Divider />

          <section className="receipt-section flex flex-col gap-1.5">
            <SectionTitle>Packages</SectionTitle>
            <Field label="Package Description" value={letter.package_description} />
            <div className="flex flex-col gap-0.5">
              <Line label="Quantity" value={String(letter.number_of_packages)} />
              <Line label="Total Weight" value={`${Number(letter.total_weight).toFixed(2)} lbs`} />
              <Line label="Declared Value" value={usd.format(Number(letter.declared_value))} />
            </div>
          </section>

          <Divider heavy />

          <section className="receipt-section flex flex-col gap-1">
            <SectionTitle>Payment</SectionTitle>
            <Line label="Price" value={formatMoney(letter.price)} />
            <Line label="Fees" value={formatMoney(letter.fees)} />
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t-2 border-black pt-1.5">
              <span className="text-[16px] font-black uppercase">Total</span>
              <span className="text-[20px] font-black">{formatMoney(letter.total)}</span>
            </div>
          </section>

          <Divider heavy />

          <section className="receipt-section text-center">
            <p className="text-[12px]">Thank you for choosing</p>
            <p className="text-[13px] font-extrabold uppercase">{company.name}</p>
          </section>

          <Divider />

          <section className="receipt-section flex flex-col gap-1">
            <SectionTitle>Terms &amp; Conditions</SectionTitle>
            <ul className="flex flex-col gap-0.5 text-[11px] leading-snug">
              {TERMS.map((term) => (
                <li key={term}>• {term}</li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  )
}
