import { notFound, redirect } from "next/navigation"
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
  "Air cargo service. Tracking number provided.",
  "Photo ID required to collect shipment.",
  "NGS is not responsible for prohibited items.",
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

function Divider() {
  return <hr className="my-1.5 border-t border-dashed border-black" />
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[12px] font-bold uppercase">{children}</h2>
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0">{label}</span>
      <span className="text-right">{value}</span>
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
          className="thermal-receipt mx-auto bg-white text-[12px] leading-snug text-black"
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
          <p className="mt-1 text-center font-mono text-[15px] font-bold">{letter.reference_number}</p>

          <Divider />

          <Line label="Printed" value={printedDate} />
          <Line
            label="Est. Delivery"
            value={letter.estimated_delivery_date ? formatDate(letter.estimated_delivery_date) : "—"}
          />

          <Divider />

          <Heading>From</Heading>
          <p>{letter.shipper_full_name}</p>
          <p>{letter.shipper_street}</p>
          <p>
            {letter.shipper_city}, {letter.shipper_state} {letter.shipper_zip}
          </p>

          <Divider />

          <Heading>To</Heading>
          <p>{letter.recipient_full_name}</p>
          <p>{letter.destination_city}, Haiti</p>

          <Divider />

          <Heading>Packages</Heading>
          <p className="break-words">{letter.package_description}</p>
          <Line label="Quantity" value={String(letter.number_of_packages)} />
          <Line label="Price" value={formatMoney(letter.price)} />
          {specialInstructions ? <p className="mt-0.5 break-words">Note: {specialInstructions}</p> : null}

          <Divider />

          <Heading>Payment</Heading>
          <Line label="Price" value={formatMoney(letter.price)} />
          <Line label="Fees" value={formatMoney(letter.fees)} />
          <div className="mt-0.5 flex justify-between gap-3 text-[15px] font-bold">
            <span>TOTAL</span>
            <span>{formatMoney(letter.total)}</span>
          </div>

          <Divider />

          <p className="text-center">
            Thank you for choosing
            <br />
            <span className="font-bold">{company.name}</span>
          </p>

          <Divider />

          <Heading>Terms</Heading>
          <ul className="text-[11px]">
            {TERMS.map((term) => (
              <li key={term}>- {term}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}
