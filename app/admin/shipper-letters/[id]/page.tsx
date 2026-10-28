import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Pencil, Plane, Receipt, Tag } from "lucide-react"
import { getAdminSession } from "@/lib/session"
import { getShipperLetterById } from "@/lib/shipper-letter-queries"
import { updateShipperLetterStatus } from "@/lib/actions/shipper-letters"
import { SHIPPER_LETTER_STATUSES, formatShipperAddressLines } from "@/lib/shipper-letter-types"
import { ShipperLetterPrintButton } from "@/components/admin/shipper-letter-print-button"
import { ShipperLetterPaymentForm } from "@/components/admin/shipper-letter-payment-form"
import { ShipperLetterDeliveryForm } from "@/components/admin/shipper-letter-delivery-form"

export const dynamic = "force-dynamic"

const printCss = `
@media print {
  @page { size: letter portrait; margin: 0.5in; }
  .sl-page { background: white !important; padding: 0 !important; min-height: 0 !important; }
  .no-print { display: none !important; }
  .sl-paper { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; padding: 0 !important; }
  .sl-section { break-inside: avoid; }
}
`

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatSignedDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="whitespace-pre-line text-sm text-slate-900">{value || "—"}</dd>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sl-section border-t border-slate-200 pt-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#0a1f44]">{title}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
    </section>
  )
}

export default async function ShipperLetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const letter = await getShipperLetterById(id)
  if (!letter) notFound()

  return (
    <div className="sl-page min-h-screen bg-navy-deep px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <form action={updateShipperLetterStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={letter.id} />
              <label htmlFor="status" className="text-sm text-muted-foreground">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={letter.status}
                className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {SHIPPER_LETTER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Update
              </button>
            </form>
            <Link
              href={`/admin/shipper-letters/${letter.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" /> Edit Shipper Letter
            </Link>
            <Link
              href={`/admin/shipper-letters/${letter.id}/receipt`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Receipt className="h-4 w-4" aria-hidden="true" /> Thermal Receipt
            </Link>
            <Link
              href={`/admin/shipper-letters/${letter.id}/label`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Tag className="h-4 w-4" aria-hidden="true" /> PRINT SHIPPING LABEL
            </Link>
            <ShipperLetterPrintButton />
          </div>
        </div>

        <ShipperLetterDeliveryForm id={letter.id} date={letter.estimated_delivery_date} />

        <ShipperLetterPaymentForm id={letter.id} price={letter.price} fees={letter.fees} />

        <article className="sl-paper rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl sm:p-10">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-[#f5a623] pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0a1f44] text-[#f5a623]">
                <Plane className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="leading-none">
                <p className="font-display text-2xl font-extrabold text-[#0a1f44]">NGS</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c47f0e]">
                  NEXTLANE GLOBAL SHIPPING
                </p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="font-display text-xl font-extrabold uppercase text-[#0a1f44]">Shipper Letter</h1>
              <p className="mt-1 font-mono text-base font-bold text-[#0a1f44]">{letter.reference_number}</p>
              <p className="mt-1 text-xs text-slate-500">
                Submitted Date: <span className="text-slate-900">{formatDateTime(letter.created_at)}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Status: <span className="font-semibold text-slate-900">{letter.status}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Estimated Delivery Date:{" "}
                <span className="font-semibold text-slate-900">
                  {letter.estimated_delivery_date ? formatSignedDate(letter.estimated_delivery_date) : "—"}
                </span>
              </p>
            </div>
          </header>

          <div className="mt-5 flex flex-col gap-5">
            <Block title="Shipper Information">
              <Row label="Full Name" value={letter.shipper_full_name} />
              <Row label="Phone Number" value={letter.shipper_phone} />
              <Row label="Email Address" value={letter.shipper_email || "—"} />
              <Row
                label="Address"
                value={formatShipperAddressLines(letter).join("\n")}
              />
            </Block>

            <Block title="Recipient Information in Haiti">
              <Row label="Full Name" value={letter.recipient_full_name} />
              <Row label="Phone Number" value={letter.recipient_phone} />
              <Row label="Destination City" value={letter.destination_city} />
            </Block>

            <Block title="Package Information">
              <div className="col-span-2">
                <Row label="Package Description" value={letter.package_description} />
              </div>
              <Row label="Number of Packages" value={String(letter.number_of_packages)} />
              <Row label="Total Weight" value={`${Number(letter.total_weight).toFixed(2)} lbs`} />
              <Row label="Declared Merchandise Value" value={usd.format(Number(letter.declared_value))} />
              <div className="col-span-2">
                <Row label="Special Instructions" value={letter.special_instructions ?? ""} />
              </div>
            </Block>

            <section className="sl-section border-t border-slate-200 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#0a1f44]">Payment</h2>
              <dl className="mt-3 ml-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Price</dt>
                  <dd className="font-mono text-slate-900">
                    {letter.price === null ? "—" : usd.format(Number(letter.price))}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Assurance fee</dt>
                  <dd className="font-mono text-slate-900">
                    {letter.fees === null ? "—" : usd.format(Number(letter.fees))}
                  </dd>
                </div>
                <div className="mt-1 flex justify-between gap-4 border-t-2 border-[#0a1f44] pt-2">
                  <dt className="font-bold uppercase text-[#0a1f44]">Total</dt>
                  <dd className="font-mono text-lg font-extrabold text-[#0a1f44]">
                    {letter.total === null ? "—" : usd.format(Number(letter.total))}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="sl-section border-t border-slate-200 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#0a1f44]">Agreement</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold">{letter.agreed_terms ? "[✓]" : "[ ]"}</span> I confirm that the
                information provided is correct and I agree to NGS NEXTLANE GLOBAL SHIPPING Terms &amp; Conditions.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="border-b border-slate-400 pb-1 font-display text-lg italic text-slate-900">
                    {letter.signature}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Customer Signature
                  </p>
                </div>
                <div>
                  <p className="border-b border-slate-400 pb-1 text-sm text-slate-900">
                    {formatSignedDate(letter.signed_date)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</p>
                </div>
              </div>
            </section>
          </div>

          <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-500">
            NEXTLANE GLOBAL SHIPPING · 83 NW 15th Pl, Pompano Beach, FL 33060 · (754) 800-6115
          </footer>
        </article>
      </div>
    </div>
  )
}
