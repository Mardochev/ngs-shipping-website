"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, ExternalLink } from "lucide-react"
import { updateShipperLetterStatus } from "@/lib/actions/shipper-letters"
import { ShareFormButton } from "@/components/admin/share-form-button"
import { SHIPPER_LETTER_STATUSES, type ShipperLetter, type ShipperLetterStatus } from "@/lib/shipper-letter-types"

export const shipperLetterStatusStyles: Record<ShipperLetterStatus, string> = {
  New: "bg-primary/15 text-primary border-primary/40",
  Processing: "bg-secondary text-foreground border-border",
  Completed: "bg-foreground/10 text-foreground border-foreground/30",
  Cancelled: "bg-transparent text-muted-foreground border-border line-through",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function digits(value: string) {
  return value.replace(/\D/g, "")
}

export function ShipperLettersPanel({ letters }: { letters: ShipperLetter[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return letters
    const qDigits = digits(q)
    return letters.filter((l) => {
      const textMatch = [l.reference_number, l.shipper_full_name, l.recipient_full_name].some((v) =>
        v.toLowerCase().includes(q),
      )
      const phoneMatch =
        qDigits.length >= 3 && [l.shipper_phone, l.recipient_phone].some((p) => digits(p).includes(qDigits))
      return textMatch || phoneMatch
    })
  }, [letters, query])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Shipper Letters</h2>
          <p className="text-sm text-muted-foreground">
            {letters.length} total · {letters.filter((l) => l.status === "New").length} new
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <ShareFormButton />
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="shipper-letter-search" className="sr-only">
            Search shipper letters
          </label>
          <input
            id="shipper-letter-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Reference, name, or phone"
            className="w-full rounded-lg border border-input bg-navy-deep py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="pb-3 pr-4 font-semibold">Reference #</th>
              <th className="pb-3 pr-4 font-semibold">Shipper</th>
              <th className="pb-3 pr-4 font-semibold">Shipper Phone</th>
              <th className="pb-3 pr-4 font-semibold">Recipient</th>
              <th className="pb-3 pr-4 font-semibold">Recipient Phone</th>
              <th className="pb-3 pr-4 font-semibold">Destination</th>
              <th className="pb-3 pr-4 font-semibold">Description</th>
              <th className="pb-3 pr-4 font-semibold">Submitted</th>
              <th className="pb-3 pr-4 font-semibold">Status</th>
              <th className="pb-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l) => (
              <tr key={l.id} className="align-middle">
                <td className="py-3 pr-4 font-mono text-xs font-semibold text-primary">{l.reference_number}</td>
                <td className="py-3 pr-4 text-foreground">{l.shipper_full_name}</td>
                <td className="py-3 pr-4 text-muted-foreground">{l.shipper_phone}</td>
                <td className="py-3 pr-4 text-foreground">{l.recipient_full_name}</td>
                <td className="py-3 pr-4 text-muted-foreground">{l.recipient_phone}</td>
                <td className="py-3 pr-4 text-muted-foreground">{l.destination_city}</td>
                <td className="max-w-[220px] truncate py-3 pr-4 text-muted-foreground" title={l.package_description}>
                  {l.package_description}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatDate(l.created_at)}</td>
                <td className="py-3 pr-4">
                  <form action={updateShipperLetterStatus}>
                    <input type="hidden" name="id" value={l.id} />
                    <label htmlFor={`status-${l.id}`} className="sr-only">
                      Status for {l.reference_number}
                    </label>
                    <select
                      id={`status-${l.id}`}
                      name="status"
                      defaultValue={l.status}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className={`rounded-md border px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring ${shipperLetterStatusStyles[l.status]}`}
                    >
                      {SHIPPER_LETTER_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-card text-foreground no-underline">
                          {s}
                        </option>
                      ))}
                    </select>
                  </form>
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/shipper-letters/${l.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Open <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-muted-foreground">
                  {letters.length === 0 ? "No Shipper Letters submitted yet." : "No Shipper Letters match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
