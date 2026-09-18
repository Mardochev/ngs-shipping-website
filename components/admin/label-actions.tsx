"use client"

import Link from "next/link"
import { Printer, ArrowLeft } from "lucide-react"

export function LabelActions() {
  return (
    <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
      >
        <Printer className="h-4 w-4" /> Print 4×6 Label
      </button>
    </div>
  )
}
