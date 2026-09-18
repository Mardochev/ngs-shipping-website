"use client"

import Link from "next/link"
import { Printer, ArrowLeft, Download, Check, X } from "lucide-react"
import { setPaymentStatus } from "@/lib/actions/admin"

export function InvoiceActions({
  shipmentId,
  paymentStatus,
}: {
  shipmentId: string
  paymentStatus: "PAID" | "UNPAID"
}) {
  return (
    <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {/* Payment status toggle */}
        <form action={setPaymentStatus} className="flex items-center gap-1 rounded-lg border border-border p-1">
          <input type="hidden" name="id" value={shipmentId} />
          <button
            type="submit"
            name="payment_status"
            value="PAID"
            aria-pressed={paymentStatus === "PAID"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              paymentStatus === "PAID"
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <Check className="h-3.5 w-3.5" /> Paid
          </button>
          <button
            type="submit"
            name="payment_status"
            value="UNPAID"
            aria-pressed={paymentStatus === "UNPAID"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              paymentStatus === "UNPAID"
                ? "bg-red-600 text-white"
                : "text-red-700 hover:bg-red-50"
            }`}
          >
            <X className="h-3.5 w-3.5" /> Unpaid
          </button>
        </form>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>
    </div>
  )
}
