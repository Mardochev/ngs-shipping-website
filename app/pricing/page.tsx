import type { Metadata } from "next"
import Link from "next/link"
import { Check, Phone } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { CtaSection } from "@/components/cta-section"
import { pricingPlans } from "@/lib/data"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, competitive air cargo pricing for shipping to Haiti with NGS. Standard air, express air, and commercial cargo rates.",
}

const faqs = [
  {
    q: "How are shipping rates calculated?",
    a: "Rates depend on the service level, weight, dimensions, and destination in Haiti. Standard and express air cargo are priced by the pound, and commercial shipments are quoted by total weight.",
  },
  {
    q: "Do you offer pickup in the USA?",
    a: "Yes. We offer scheduled pickup across South Florida, and drop-off at our Pompano Beach facility is always free.",
  },
  {
    q: "Is my shipment insured?",
    a: "Insurance is available on all shipments and included on express air cargo. Ask our team about coverage options for your cargo.",
  },
  {
    q: "How long does delivery take?",
    a: "Express air cargo arrives in about 48 hours, while standard air cargo typically takes 3 to 5 days depending on customs clearance.",
  },
]

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple, transparent shipping rates"
        description="No hidden fees, no surprises. Choose the option that fits your shipment and budget. Contact us for a custom quote."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-[0_0_0_1px_rgba(245,166,35,0.3)]"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.unit}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-apricot-light"
                    : "border border-border bg-secondary text-foreground hover:border-primary"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          Need a custom quote for commercial cargo or large-volume shipments? Call us at{" "}
          <a href={site.phoneHref} className="font-semibold text-primary hover:underline">
            {site.phone}
          </a>{" "}
          and we&apos;ll build a plan that fits.
        </p>
      </section>

      <section className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <dl className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-6">
                <dt className="font-display font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 text-center">
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Still have questions? Call us
            </a>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
