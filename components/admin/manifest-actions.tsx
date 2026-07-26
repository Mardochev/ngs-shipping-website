"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Printer, FileDown, FileSpreadsheet, Pencil, Plane, MapPin, PackageCheck, Trash2 } from "lucide-react"
import {
  updateManifest,
  updateManifestStatus,
  removePackageFromManifest,
} from "@/lib/actions/manifests"
import { MANIFEST_DESTINATIONS, type Manifest, type ManifestStatus } from "@/lib/types"
import { Modal } from "./modal"
import { SubmitButton } from "./submit-button"

export type ManifestRow = {
  index: number
  tracking: string
  sender: string
  receiver: string
  phone: string
  description: string
  quantity: number
  weight: number
  declaredValue: number
}

export type ManifestMeta = {
  manifest_number: string
  destination: string
  shipment_date: string
  carrier: string
  flight_number: string
  status: ManifestStatus
  total_packages: number
  total_weight: number
  total_declared_value: number
}

const company = {
  name: "NEXTLANE GLOBAL SHIPPING",
  addressLines: ["83 NW 15th Pl", "Pompano Beach, FL 33060", "USA"],
  phone: "+1 (754) 326-3413",
}

const inputClass =
  "w-full rounded-lg border border-input bg-navy-deep px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground"

// Next status in the lifecycle -> button config.
const nextTransitions: Record<
  ManifestStatus,
  { status: ManifestStatus; label: string; icon: typeof Plane }[]
> = {
  Draft: [{ status: "Manifested", label: "Mark Manifested", icon: PackageCheck }],
  Manifested: [{ status: "Departed USA", label: "Mark Departed USA", icon: Plane }],
  "Departed USA": [{ status: "Arrived Haiti", label: "Mark Arrived Haiti", icon: MapPin }],
  "Arrived Haiti": [{ status: "Closed", label: "Close (Ready for Pickup)", icon: PackageCheck }],
  Closed: [],
}

export function ManifestActions({ manifest, rows }: { manifest: Manifest; rows: ManifestRow[] }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction] = useActionState(updateManifest, {})

  useEffect(() => {
    if (state?.success) setEditing(false)
  }, [state])

  async function downloadPdf() {
    const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")])
    const autoTable = autoTableModule.default
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(company.name, 40, 40)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text([...company.addressLines, `Tel: ${company.phone}`], 40, 56)

    doc.setFontSize(15)
    doc.setFont("helvetica", "bold")
    doc.text("CARGO MANIFEST", 560, 40)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      [
        `Manifest #: ${manifest.manifest_number}`,
        `Destination: ${manifest.destination}`,
        `Shipment date: ${manifest.shipment_date || "—"}`,
        `Carrier: ${manifest.carrier || "—"}   Flight/Ref: ${manifest.flight_number || "—"}`,
        `Status: ${manifest.status}`,
      ],
      560,
      56,
    )

    autoTable(doc, {
      startY: 130,
      head: [["#", "Tracking #", "Sender", "Receiver", "Description", "Qty", "Weight (lb)", "Declared $"]],
      body: rows.map((r) => [
        r.index,
        r.tracking,
        r.sender,
        `${r.receiver}${r.phone ? `\n${r.phone}` : ""}`,
        r.description,
        r.quantity,
        r.weight.toFixed(1),
        r.declaredValue.toFixed(2),
      ]),
      foot: [
        [
          "",
          "",
          "",
          "",
          "TOTALS",
          String(manifest.total_packages),
          Number(manifest.total_weight).toFixed(1),
          Number(manifest.total_declared_value).toFixed(2),
        ],
      ],
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [10, 42, 74], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
    })

    doc.save(`${manifest.manifest_number}.pdf`)
  }

  async function exportExcel() {
    const XLSX = await import("xlsx")
    const data = rows.map((r) => ({
      "#": r.index,
      "Tracking #": r.tracking,
      Sender: r.sender,
      Receiver: r.receiver,
      Phone: r.phone,
      Description: r.description,
      Qty: r.quantity,
      "Weight (lb)": r.weight,
      "Declared Value": r.declaredValue,
    }))
    data.push({
      "#": "" as never,
      "Tracking #": "",
      Sender: "",
      Receiver: "",
      Phone: "",
      Description: "TOTALS",
      Qty: manifest.total_packages,
      "Weight (lb)": Number(manifest.total_weight),
      "Declared Value": Number(manifest.total_declared_value),
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Manifest")
    XLSX.writeFile(wb, `${manifest.manifest_number}.xlsx`)
  }

  const transitions = nextTransitions[manifest.status] ?? []

  return (
    <div className="no-print flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        </div>
      </div>

      {transitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Advance status:</span>
          {transitions.map((t) => {
            const Icon = t.icon
            return (
              <form key={t.status} action={updateManifestStatus}>
                <input type="hidden" name="id" value={manifest.id} />
                <input type="hidden" name="status" value={t.status} />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm(`${t.label}? This updates every package on this manifest.`)) e.preventDefault()
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              </form>
            )
          })}
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title={`Edit ${manifest.manifest_number}`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={manifest.id} />
          {state?.error && (
            <p
              className="rounded-lg border border-apricot-light/40 bg-apricot-light/10 px-3 py-2 text-sm text-apricot-light"
              role="alert"
            >
              {state.error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="edit_destination">
                Destination
              </label>
              <select
                id="edit_destination"
                name="destination"
                defaultValue={manifest.destination}
                className={inputClass}
              >
                {MANIFEST_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="edit_date">
                Shipment date
              </label>
              <input
                id="edit_date"
                name="shipment_date"
                type="date"
                defaultValue={manifest.shipment_date ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="edit_carrier">
                Carrier
              </label>
              <input
                id="edit_carrier"
                name="carrier"
                defaultValue={manifest.carrier ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="edit_flight">
                Flight / reference number
              </label>
              <input
                id="edit_flight"
                name="flight_number"
                defaultValue={manifest.flight_number ?? ""}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function RemovePackageButton({ manifestId, packageId, tracking }: { manifestId: string; packageId: string; tracking: string }) {
  return (
    <form action={removePackageFromManifest} className="no-print">
      <input type="hidden" name="manifest_id" value={manifestId} />
      <input type="hidden" name="package_id" value={packageId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Remove ${tracking} from this manifest? It will return to Ready for Shipment.`))
            e.preventDefault()
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-red-400"
        aria-label={`Remove ${tracking}`}
        title="Remove from manifest"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  )
}
