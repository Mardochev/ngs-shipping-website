import Image from "next/image"
import { Phone, Truck } from "lucide-react"
import { site } from "@/lib/site"

export function PickupSection() {
  return (
    <section
      aria-labelledby="pickup-title"
      className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-5 lg:gap-14">
        <div className="overflow-hidden rounded-3xl border border-border shadow-2xl shadow-navy-deep/50 lg:col-span-3">
          <Image
            src="/ngs-pickup-van.png"
            alt="White NGS cargo van with the NEXTLANE GLOBAL SHIPPING logo parked on a palm-lined Florida street"
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="h-auto w-full"
          />
        </div>

        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Truck className="h-4 w-4" aria-hidden="true" />
            Pickup Service
          </span>
          <h2
            id="pickup-title"
            className="mt-4 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl"
          >
            We pick up your packages.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Arrange package pickup from your home or business in Florida. Call NGS to confirm
            pickup availability, service area, and scheduling.
          </p>
          <a
            href={site.callHref}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light sm:w-auto"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call to Schedule a Pickup
          </a>
        </div>
      </div>
    </section>
  )
}
