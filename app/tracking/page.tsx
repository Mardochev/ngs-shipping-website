import type { Metadata } from "next"
import { Phone } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { TrackingForm } from "@/components/tracking-form"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Track Your Shipment",
  description:
    "Track your NGS shipment from the USA to Haiti in real time. Enter your tracking number to see the latest status.",
}

export default function TrackingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tracking"
        title="Track your shipment"
        description="Enter your NGS tracking number below to see exactly where your cargo is on its way to Haiti."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <TrackingForm />

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-navy-deep p-6 text-center sm:p-8">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Can&apos;t find your shipment?
          </h2>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            Our team is here to help you locate your cargo and answer any questions about your
            delivery to Haiti.
          </p>
          <a
            href={site.phoneHref}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call {site.phone}
          </a>
        </div>
      </section>
    </>
  )
}
