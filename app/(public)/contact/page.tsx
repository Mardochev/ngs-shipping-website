import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact NEXTLANE GLOBAL SHIPPING (NGS) for shipping quotes and support. Call 754-326-3413 or visit us in Pompano Beach, FL.",
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's get your shipment moving"
        description="Have a question or ready to ship to Haiti? Reach out and our friendly, bilingual team will be glad to help."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Get in touch</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Call us, send a message, or stop by our Pompano Beach facility. We&apos;re here to make
              shipping to Haiti easy.
            </p>

            <ul className="mt-8 space-y-5">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-muted-foreground">Call / WhatsApp</span>
                    <span className="font-display text-lg font-semibold text-foreground">
                      {site.phone}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-muted-foreground">Chat on WhatsApp</span>
                    <span className="font-display text-lg font-semibold text-foreground">
                      {site.phone}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.emailHref}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-muted-foreground">Email</span>
                    <span className="font-display text-lg font-semibold text-foreground">
                      {site.email}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={site.websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Globe className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-muted-foreground">Website</span>
                    <span className="font-display text-lg font-semibold text-foreground">
                      {site.website}
                    </span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-muted-foreground">Visit us</span>
                  <span className="font-display text-lg font-semibold text-foreground">
                    {site.address}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-muted-foreground">Hours</span>
                  <span className="font-display text-lg font-semibold text-foreground">
                    Mon – Sat, 9am – 6pm
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
