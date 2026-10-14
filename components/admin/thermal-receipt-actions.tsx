"use client"

import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

const PX_PER_MM = 96 / 25.4

// Browsers can't print an "auto-height" page, so measure the rendered receipt
// and size the print page to it. This prints as one continuous strip on the
// Star TSP100 instead of being split into fixed-length pages.
function printReceipt() {
  const receipt = document.querySelector<HTMLElement>(".thermal-receipt")
  const heightMm = receipt ? Math.ceil(receipt.scrollHeight / PX_PER_MM) + 6 : 300

  let style = document.getElementById("thermal-page-size") as HTMLStyleElement | null
  if (!style) {
    style = document.createElement("style")
    style.id = "thermal-page-size"
    document.head.appendChild(style)
  }
  style.textContent = `@media print { @page { size: 80mm ${heightMm}mm; margin: 0; } }`

  window.print()
}

export function ThermalReceiptActions({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Shipper Letter
      </Link>
      <button
        type="button"
        onClick={printReceipt}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Printer className="h-4 w-4" aria-hidden="true" /> Print Receipt
      </button>
    </div>
  )
}
