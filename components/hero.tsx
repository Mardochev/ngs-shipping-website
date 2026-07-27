import Image from "next/image"
import Link from "next/link"
import { Phone, ArrowRight, Plane, CheckCircle2 } from "lucide-react"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            USA {"\u{1F1FA}\u{1F1F8}"} {"\u279C"} Haiti {"\u{1F1ED}\u{1F1F9}"}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-balance text-foreground sm:text-6xl">
            Air Cargo from USA to{" "}
            <span className="text-primary">Haiti</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Reliable air cargo service from USA to Haiti. Now shipping to Port-au-Prince,
            Cap-Ha&iuml;tien &amp; Les Cayes.
          </p>
          <p className="mt-3 max-w-xl text-pretty text-base font-medium leading-relaxed text-primary">
            Nou pran koli pou Pòtoprens, Okap ak Okay.
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
              Call / WhatsApp: {site.phone}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-3">
            {[
              "Now serving USA to Haiti",
              "Estimated delivery: 5\u201310 business days",
              "Secure & tracked shipping",
            ].map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
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
              <p className="font-display text-sm font-bold text-foreground">Air Cargo to Haiti</p>
              <p className="text-xs text-muted-foreground">Estimated delivery: 5{"\u2013"}10 business days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
