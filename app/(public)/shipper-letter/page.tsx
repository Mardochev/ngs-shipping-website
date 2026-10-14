import type { Metadata } from "next"
import { Plane } from "lucide-react"
import { ShipperLetterForm } from "@/components/shipper-letter-form"

export const metadata: Metadata = {
  title: "Shipper Letter | NGS NEXTLANE GLOBAL SHIPPING",
  description:
    "Complete your NGS Shipper Letter for air cargo from the USA to Les Cayes, Cap-Haïtien, and Port-au-Prince, Haiti.",
}

export default function ShipperLetterPage() {
  return (
    <section className="bg-navy-deep px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-3xl font-extrabold tracking-tight text-foreground">NGS</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">
                NEXTLANE GLOBAL SHIPPING
              </span>
            </span>
          </div>
          <h1 className="mt-8 font-display text-3xl font-extrabold text-balance text-foreground sm:text-4xl">
            Shipper Letter
          </h1>
          <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Fill out this form before dropping off your packages. You will receive a reference number when you
            submit.
          </p>
        </header>

        <div className="mt-10">
          <ShipperLetterForm />
        </div>
      </div>
    </section>
  )
}
