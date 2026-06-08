import Image from "next/image"
import Link from "next/link"
import { Phone, ArrowRight, Plane } from "lucide-react"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div className="absolute inset-0">
        <Image
          src="/hero-plane.png"
          alt="Cargo freighter airplane flying through neon light trails"
          fill
          priority
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/75 to-navy-deep/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              USA {"\u{1F1FA}\u{1F1F8}"} {"\u279C"} Haiti {"\u{1F1ED}\u{1F1F9}"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              Haiti {"\u{1F1ED}\u{1F1F9}"} Dir{"\u00E8"}k
            </span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-balance text-foreground sm:text-6xl">
            Air Cargo Shipping to{" "}
            <span className="text-primary">Haiti</span>
          </h1>
          <p className="mt-4 font-display text-lg font-semibold tracking-wide text-foreground sm:text-xl">
            Fast {"\u2022"} Secure {"\u2022"} Reliable Air Cargo Service
          </p>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            NEXTLANE GLOBAL SHIPPING (NGS) moves your packages and commercial cargo from the United
            States to Haiti by air cargo {"\u2014"} with care, speed, and full tracking every step of
            the way.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2">
            <Plane className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              {site.slogan}
            </span>
          </div>

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
              { value: "48hr", label: "Air cargo to Haiti" },
              { value: "100%", label: "Tracked & insured" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-3xl font-bold text-primary">{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="overflow-hidden rounded-3xl border border-border shadow-2xl shadow-navy-deep/50">
            <Image
              src="/cargo-plane.png"
              alt="Cargo freighter airplane being loaded with containers on the tarmac"
              width={760}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-5 py-3 backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Plane className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Express Air Cargo</p>
              <p className="text-xs text-muted-foreground">Delivered in as little as 48 hours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
