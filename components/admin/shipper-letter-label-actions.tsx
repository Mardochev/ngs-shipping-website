"use client"

import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

export function ShipperLetterLabelActions({ letterId }: { letterId: string }) {
  return (
    <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`/admin/shipper-letters/${letterId}`}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Shipper Letter
      </Link>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
      >
        <Printer className="h-4 w-4" aria-hidden="true" /> Print Label
      </button>
    </div>
  )
}
