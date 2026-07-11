import Link from "next/link"
import { Phone } from "lucide-react"
import { site } from "@/lib/site"

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-navy-light to-card px-6 py-14 text-center sm:px-12">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Ready to ship to Haiti {"\u{1F1ED}\u{1F1F9}"}?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Get a free quote today for reliable air cargo from USA to Haiti. We receive packages for
          Okap and Okay. Port-au-Prince coming soon.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={site.phoneHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light sm:w-auto"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call / WhatsApp: {site.phone}
          </a>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-6 py-3 text-base font-semibold text-foreground transition-colors hover:border-primary sm:w-auto"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
