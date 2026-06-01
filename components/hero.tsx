import Image from "next/image"
import Link from "next/link"
import { Phone, ArrowRight, ShieldCheck } from "lucide-react"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div className="absolute inset-0">
        <Image
          src="/hero-truck.png"
          alt="Glowing wireframe cargo truck driving along neon light trails"
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            USA {"\u2192"} Haiti {"\u{1F1ED}\u{1F1F9}"}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-balance text-foreground sm:text-6xl">
            Fast & reliable shipping to{" "}
            <span className="text-primary">Haiti</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            NEXTLANE GLOBAL SHIPPING moves your barrels, packages, and vehicles from the United
            States to Haiti with care, speed, and full tracking every step of the way.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
            >
              Get a Free Quote
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/60 px-6 py-3 text-base font-semibold text-foreground backdrop-blur transition-colors hover:border-primary"
            >
              <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
              {site.phone}
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {[
              { value: "10K+", label: "Shipments delivered" },
              { value: "48hr", label: "Air freight to Haiti" },
              { value: "100%", label: "Tracked & insured" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl font-bold text-primary">{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
