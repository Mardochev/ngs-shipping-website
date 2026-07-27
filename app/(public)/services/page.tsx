import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { CtaSection } from "@/components/cta-section"
import { services, steps } from "@/lib/data"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore NGS air cargo services: air cargo, package delivery, tracking services, and commercial shipments from the USA to Haiti.",
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Services"
        title="Air cargo services to Haiti"
        description="From a single package to full commercial shipments, NGS moves everything you need from the USA to Haiti by air cargo."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/60"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Built for Haiti
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              Specialized in USA to Haiti logistics
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              We know the routes, the ports, and the customs requirements. Our specialized knowledge
              of shipping to Haiti means fewer delays and a smoother experience for you and your
              recipients.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Direct routes to Port-au-Prince, Cap-Ha\u00EFtien (Okap) and Les Cayes (Okay)",
                "Customs documentation and clearance support",
                "Consolidation services to lower your costs",
                "Flexible pickup and drop-off scheduling",
                "Commercial and personal shipment handling",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <h3 className="font-display text-xl font-semibold text-foreground">How it works</h3>
            <ol className="mt-6 space-y-6">
              {steps.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{step.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
