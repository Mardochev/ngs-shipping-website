import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Plane, Clock, Radar } from "lucide-react"
import { Hero } from "@/components/hero"
import { CtaSection } from "@/components/cta-section"
import { services, steps } from "@/lib/data"

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Air Cargo focus */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl shadow-navy-deep/50">
              <Image
                src="/air-cargo.png"
                alt="Workers loading boxes and pallets into a cargo airplane"
                width={760}
                height={560}
                className="h-full w-full object-cover"
              />
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-card/95 px-5 py-3 backdrop-blur sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Plane className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-foreground">Air Cargo to Haiti</p>
                  <p className="text-xs text-muted-foreground">Estimated delivery: 5{"\u2013"}10 business days</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Air cargo specialists
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
                Air Cargo Shipping to Haiti
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                NGS connects the USA and Haiti with fast, secure air cargo. From a single package to
                full commercial shipments, we move everything you need by air {"\u2014"} quickly,
                safely, and fully tracked.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Clock, text: "Estimated delivery: 5\u201310 business days" },
                  { icon: CheckCircle2, text: "Secure & tracked shipping with a tracking number" },
                  { icon: Radar, text: "Real-time tracking from drop-off to delivery" },
                  { icon: Plane, text: "Air cargo to Port-au-Prince, Cap-Ha\u00EFtien & Les Cayes" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Routes we serve */}
      <section className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Routes We Serve
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              Direct air cargo lanes to Haiti
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Now shipping to Port-au-Prince, Cap-Ha&iuml;tien &amp; Les Cayes.
            </p>
            <p className="mt-2 text-pretty leading-relaxed text-primary">
              Nou pran koli pou P&ograve;toprens, Okap ak Okay.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { from: "USA", fromFlag: "\u{1F1FA}\u{1F1F8}", to: "Port-au-Prince, Haiti", toFlag: "\u{1F1ED}\u{1F1F9}", available: true },
              { from: "USA", fromFlag: "\u{1F1FA}\u{1F1F8}", to: "Cap-Ha\u00EFtien (Okap), Haiti", toFlag: "\u{1F1ED}\u{1F1F9}", available: true },
              { from: "USA", fromFlag: "\u{1F1FA}\u{1F1F8}", to: "Les Cayes (Okay), Haiti", toFlag: "\u{1F1ED}\u{1F1F9}", available: true },
            ].map((route) => (
              <div
                key={route.to}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/60"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Plane className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      route.available
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {route.available ? "Available now" : "Coming soon"}
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">From</p>
                    <p className="mt-1 font-display text-base font-semibold text-foreground">
                      <span aria-hidden="true">{route.fromFlag}</span> {route.from}
                    </p>
                  </div>
                </div>

                <div className="my-4 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">To</p>
                    <p className="mt-1 font-display text-base font-semibold text-foreground">
                      <span aria-hidden="true">{route.toFlag}</span> {route.to}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              src="/air-cargo.png"
              alt="Boxes and pallets being loaded into a cargo airplane"
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
              NEXTLANE GLOBAL SHIPPING is now serving USA to Haiti, helping families and
              businesses send what matters most. We combine competitive rates with the personal care
              of a team that understands the Haitian community.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Competitive, transparent pricing",
                "Full shipment tracking",
                "Cargo insurance options available",
                "Bilingual customer support",
                "Fast, secure air cargo",
                "Convenient pickup locations",
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
