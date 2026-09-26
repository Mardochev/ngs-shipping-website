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
            <Plane className="h-4 w-4" aria-hidden="true" />
            {site.slogan}
          </span>
          <h1 className="mt-5 font-display text-[2.125rem] font-extrabold leading-[1.1] text-balance text-foreground sm:text-5xl">
            Air Cargo from USA to Haiti
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Reliable air cargo service to Les Cayes, Cap-Ha&iuml;tien, and Port-au-Prince.
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
              href={site.callHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/60 px-6 py-3 text-base font-semibold text-foreground backdrop-blur transition-colors hover:border-primary"
            >
              <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
              Call: {site.callNumber}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-3">
            {["Estimated delivery: 5\u201310 business days", "Secure & tracked shipping"].map((item) => (
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
        </div>
      </div>
    </section>
  )
}
