import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Hero } from "@/components/hero"
import { CtaSection } from "@/components/cta-section"
import { services, steps } from "@/lib/data"

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Services preview */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                What we do
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
                Shipping solutions for every need
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-apricot-light"
            >
              View all services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/60"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <Image
              src="/cargo-ship.png"
              alt="Cargo ship loaded with shipping containers at port"
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Why NGS
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              The trusted bridge between the USA and Haiti
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              For years, families and businesses have counted on NEXTLANE GLOBAL SHIPPING to deliver
              what matters most. We combine competitive rates with the personal care of a team that
              understands the Haitian community.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Competitive, transparent pricing",
                "Full shipment tracking",
                "Cargo insurance available",
                "Bilingual customer support",
                "Fast air & ocean options",
                "Door-to-door delivery",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Simple process
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              How shipping with NGS works
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.step} className="relative rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-4xl font-extrabold text-primary/30">
                  {step.step}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
