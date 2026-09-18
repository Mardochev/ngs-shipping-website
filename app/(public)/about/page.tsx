import type { Metadata } from "next"
import Image from "next/image"
import { Target, Heart, Globe2, Award } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { CtaSection } from "@/components/cta-section"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about NEXTLANE GLOBAL SHIPPING (NGS), your trusted partner for fast and reliable shipping from the USA to Haiti.",
}

const values = [
  {
    icon: Heart,
    title: "Community First",
    description:
      "We understand the bonds that connect the Haitian diaspora to home, and we treat every shipment like family.",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description:
      "From the USA to every corner of Haiti, our network ensures your cargo gets where it needs to go.",
  },
  {
    icon: Award,
    title: "Reliability",
    description:
      "On-time delivery, secure handling, and transparent tracking on every single order we manage.",
  },
  {
    icon: Target,
    title: "Fair Pricing",
    description:
      "Honest, competitive rates with no hidden fees so you always know exactly what you are paying for.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About NGS"
        title="Connecting families and businesses across borders"
        description="NEXTLANE GLOBAL SHIPPING was built to make sending goods from the United States to Haiti simple, affordable, and worry-free."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              Our story
            </h2>
            <div className="mt-5 space-y-4 text-pretty leading-relaxed text-muted-foreground">
              <p>
                Based in Pompano Beach, Florida, NEXTLANE GLOBAL SHIPPING (NGS) was founded on a
                simple promise: to give the Haitian community a shipping partner they can truly
                trust. We saw families struggling with unreliable carriers, hidden fees, and lost
                packages, and we knew there was a better way.
              </p>
              <p>
                We are now serving USA to Haiti, moving packages and commercial air cargo for
                our community. Whether you are sending a care package to family or managing
                commercial cargo, our team handles every detail with precision and care.
              </p>
              <p>
                Our bilingual staff, modern tracking technology, and deep ties to the community make
                us more than a shipping company. We are the next lane forward for everyone who
                depends on the connection between the United States and Haiti.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <Image
              src="/air-cargo.png"
              alt="Cargo boxes and pallets being loaded into a freighter airplane"
              width={800}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-navy-deep px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
              What we stand for
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Our values guide every shipment we handle and every customer we serve.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <value.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
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
