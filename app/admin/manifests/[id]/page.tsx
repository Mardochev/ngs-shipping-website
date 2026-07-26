import { notFound, redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getManifestById } from "@/lib/queries"
import {
  ManifestActions,
  RemovePackageButton,
  type ManifestRow,
} from "@/components/admin/manifest-actions"

export const dynamic = "force-dynamic"

const company = {
  name: "NEXTLANE GLOBAL SHIPPING",
  shortName: "NGS",
  addressLines: ["83 NW 15th Pl", "Pompano Beach, FL 33060", "USA"],
  phone: "+1 (754) 326-3413",
} as const

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

const manifestPrintCss = `
@media print {
  @page { size: A4 landscape; margin: 0.4in; }
  .manifest-page { background: white !important; padding: 0 !important; }
  .no-print { display: none !important; }
  .manifest-paper { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
}
`

export default async function ManifestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const manifest = await getManifestById(id)
  if (!manifest) notFound()

  const rows: ManifestRow[] = manifest.packages.map((p, i) => ({
    index: i + 1,
    tracking: p.tracking_number,
    sender: p.customers?.full_name ?? "—",
    receiver: p.recipient_name ?? "—",
    phone: p.recipient_phone ?? "",
    description: p.description ?? "",
    quantity: p.quantity ?? 1,
    weight: Number(p.weight_lb) || 0,
    declaredValue: Number(p.declared_value) || 0,
  }))

  return (
    <div className="manifest-page min-h-screen bg-navy-deep px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: manifestPrintCss }} />

      <div className="mx-auto max-w-6xl">
        <div className="no-print mb-6">
          <ManifestActions manifest={manifest} rows={rows} />
        </div>

        <div className="manifest-paper mx-auto rounded-2xl bg-white p-8 text-black shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-lg font-extrabold text-white"
                style={{ backgroundColor: "#0a2a4a", fontSize: "20px" }}
              >
                {company.shortName}
              </span>
              <div className="leading-tight">
                <p className="text-lg font-extrabold" style={{ color: "#0a2a4a" }}>
                  {company.name}
                </p>
                <p className="text-xs text-neutral-600">{company.addressLines.join(", ")}</p>
                <p className="text-xs text-neutral-600">Tel: {company.phone} · Air Cargo USA → Haiti</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold tracking-tight" style={{ color: "#0a2a4a" }}>
                CARGO MANIFEST
              </p>
              <p className="font-mono text-sm font-bold">{manifest.manifest_number}</p>
              <span className="mt-1 inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                {manifest.status}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 py-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Destination</p>
              <p className="font-semibold">{manifest.destination}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Shipment date</p>
              <p className="font-semibold">{formatDate(manifest.shipment_date)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Carrier</p>
              <p className="font-semibold">{manifest.carrier || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Flight / Ref #</p>
              <p className="font-semibold">{manifest.flight_number || "—"}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: "#0a2a4a" }} className="text-white">
                  <th className="border border-neutral-300 px-2 py-2 font-semibold">#</th>
                  <th className="border border-neutral-300 px-2 py-2 font-semibold">Tracking #</th>
                  <th className="border border-neutral-300 px-2 py-2 font-semibold">Sender</th>
                  <th className="border border-neutral-300 px-2 py-2 font-semibold">Receiver</th>
                  <th className="border border-neutral-300 px-2 py-2 font-semibold">Description</th>
                  <th className="border border-neutral-300 px-2 py-2 text-right font-semibold">Qty</th>
                  <th className="border border-neutral-300 px-2 py-2 text-right font-semibold">Weight</th>
                  <th className="border border-neutral-300 px-2 py-2 text-right font-semibold">Declared $</th>
                  <th className="no-print border border-neutral-300 px-2 py-2 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {manifest.packages.length === 0 && (
                  <tr>
                    <td colSpan={9} className="border border-neutral-300 px-2 py-8 text-center text-neutral-500">
                      No packages on this manifest.
                    </td>
                  </tr>
                )}
                {manifest.packages.map((p, i) => (
                  <tr key={p.id} className="even:bg-neutral-50">
                    <td className="border border-neutral-300 px-2 py-2">{i + 1}</td>
                    <td className="border border-neutral-300 px-2 py-2 font-mono text-xs font-semibold">
                      {p.tracking_number}
                    </td>
                    <td className="border border-neutral-300 px-2 py-2">{p.customers?.full_name ?? "—"}</td>
                    <td className="border border-neutral-300 px-2 py-2">
                      <div>{p.recipient_name ?? "—"}</div>
                      {p.recipient_phone && <div className="text-xs text-neutral-500">{p.recipient_phone}</div>}
                    </td>
                    <td className="border border-neutral-300 px-2 py-2">{p.description ?? ""}</td>
                    <td className="border border-neutral-300 px-2 py-2 text-right">{p.quantity ?? 1}</td>
                    <td className="border border-neutral-300 px-2 py-2 text-right">
                      {(Number(p.weight_lb) || 0).toFixed(1)} lb
                    </td>
                    <td className="border border-neutral-300 px-2 py-2 text-right">
                      ${(Number(p.declared_value) || 0).toFixed(2)}
                    </td>
                    <td className="no-print border border-neutral-300 px-2 py-2">
                      <RemovePackageButton
                        manifestId={manifest.id}
                        packageId={p.id}
                        tracking={p.tracking_number}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-bold">
                  <td className="border border-neutral-300 px-2 py-2" colSpan={5}>
                    TOTALS
                  </td>
                  <td className="border border-neutral-300 px-2 py-2 text-right">{manifest.total_packages}</td>
                  <td className="border border-neutral-300 px-2 py-2 text-right">
                    {Number(manifest.total_weight).toFixed(1)} lb
                  </td>
                  <td className="border border-neutral-300 px-2 py-2 text-right">
                    ${Number(manifest.total_declared_value).toFixed(2)}
                  </td>
                  <td className="no-print border border-neutral-300 px-2 py-2"> </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="border-t border-black pt-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Prepared by
              </div>
            </div>
            <div>
              <div className="border-t border-black pt-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Received by (Haiti)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
