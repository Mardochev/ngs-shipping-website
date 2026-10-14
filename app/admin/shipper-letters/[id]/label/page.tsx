import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getShipperLetterById } from "@/lib/shipper-letter-queries"
import { getBarcodeSvg } from "@/lib/barcode"
import { ShipperLetterLabelActions } from "@/components/admin/shipper-letter-label-actions"
import { PrintAirplaneIcon } from "@/components/print/print-airplane-icon"

export const dynamic = "force-dynamic"

const company = {
  name: "NEXTLANE GLOBAL SHIPPING",
  website: "www.ngsshipping.com",
  phone: "+1 (954) 939-8617",
} as const

function formatDateOnly(value: string | null) {
  if (!value) return "—"
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const labelPrintCss = `
@media print {
  @page { size: 4in 6in; margin: 0; }
  html, body { background: white !important; }
  .label-page { background: white !important; padding: 0 !important; margin: 0 !important; min-height: 0 !important; }
  .no-print { display: none !important; }
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

const clamp = (lines: number) =>
  ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }) as const

export default async function ShipperLetterLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const letter = await getShipperLetterById(id)
  if (!letter) notFound()

  const barcodeSvg = getBarcodeSvg(letter.reference_number, { height: 48 })
  const shipperAddress = `${letter.shipper_street}, ${letter.shipper_city}, ${letter.shipper_state} ${letter.shipper_zip}`

  return (
    <div className="label-page min-h-screen bg-navy-deep px-4 py-8 print:bg-white print:p-0">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: labelPrintCss }} />

      <div className="mx-auto max-w-md">
        <div className="no-print mb-6">
          <ShipperLetterLabelActions letterId={letter.id} />
        </div>

        <div
          className="shipping-label mx-auto flex flex-col overflow-hidden bg-white text-black shadow-2xl"
          style={{ width: "4in", height: "6in", padding: "0.18in", fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="flex h-10 w-10 items-center justify-center rounded border-2 border-black font-extrabold"
                style={{ fontSize: "15px" }}
              >
                NGS
              </span>
              <div className="leading-tight">
                <p className="font-extrabold" style={{ fontSize: "12px" }}>
                  {company.name}
                </p>
                <p style={{ fontSize: "8px" }}>
                  {company.website} · {company.phone}
                </p>
              </div>
            </div>
            <p className="text-right font-bold uppercase leading-tight" style={{ fontSize: "8px" }}>
              Air Cargo
              <br />
              USA → Haiti
            </p>
          </div>

          {/* From */}
          <div className="border-b border-black py-1.5">
            <p className="font-bold uppercase" style={{ fontSize: "10px" }}>
              From / Shipper
            </p>
            <p className="font-bold" style={{ fontSize: "12px", lineHeight: 1.2 }}>
              {letter.shipper_full_name}
            </p>
            <p style={{ fontSize: "10px", lineHeight: 1.25, ...clamp(2) }}>{shipperAddress}</p>
            <p style={{ fontSize: "10px" }}>Tel: {letter.shipper_phone}</p>
          </div>

          {/* To */}
          <div className="border-b-2 border-black py-1.5">
            <p className="font-bold uppercase" style={{ fontSize: "10px" }}>
              Ship To / Recipient
            </p>
            <p className="font-extrabold" style={{ fontSize: "17px", lineHeight: 1.15, ...clamp(2) }}>
              {letter.recipient_full_name}
            </p>
            <p className="font-extrabold uppercase" style={{ fontSize: "15px", lineHeight: 1.2 }}>
              {letter.destination_city}, Haiti
            </p>
            <p style={{ fontSize: "12px" }}>Tel: {letter.recipient_phone}</p>
          </div>

          {/* Package information */}
          <div className="border-b border-black py-1.5">
            <p className="font-bold uppercase" style={{ fontSize: "10px" }}>
              Package Information
            </p>
            <p style={{ fontSize: "11px", lineHeight: 1.25, ...clamp(2) }}>{letter.package_description}</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <div>
                <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
                  Packages
                </p>
                <p className="font-bold" style={{ fontSize: "13px" }}>
                  {letter.number_of_packages}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
                  Weight
                </p>
                <p className="font-bold" style={{ fontSize: "13px" }}>
                  {Number(letter.total_weight)} lb
                </p>
              </div>
              <div>
                <p className="font-bold uppercase" style={{ fontSize: "8px" }}>
                  Est. Delivery
                </p>
                <p className="font-bold" style={{ fontSize: "12px" }}>
                  {formatDateOnly(letter.estimated_delivery_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" aria-hidden="true" />

          {/* Barcode, airplane, tracking number */}
          <div className="flex flex-col items-center pt-1.5">
            <div
              aria-hidden="true"
              style={{ height: "52px", width: "3.5in" }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
            <PrintAirplaneIcon size={20} />
            <p className="font-bold uppercase" style={{ fontSize: "9px" }}>
              Tracking / Reference Number
            </p>
            <p className="font-mono font-extrabold" style={{ fontSize: "20px", letterSpacing: "0.5px", lineHeight: 1.1 }}>
              {letter.reference_number}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
