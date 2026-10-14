"use client"

import { Printer } from "lucide-react"

export function ShipperLetterPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
    >
      <Printer className="h-4 w-4" aria-hidden="true" /> Print
    </button>
  )
}
