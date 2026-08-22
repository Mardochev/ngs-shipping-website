"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Copy, MapPin, MessageCircle, Phone, UserPlus } from "lucide-react"
import { site } from "@/lib/site"

const steps = [
  "Kreye kont NGS ou",
  "Achte pwodwi ou sou entènèt",
  "Voye koli a nan adrès NGS nan Florid",
  "NGS voye koli ou pou Okay",
] as const

const addressLines = ["83 NW 15th Pl", "Pompano Beach, FL 33060"] as const

export function OkayOnlineShopping() {
  const [copied, setCopied] = useState(false)

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(addressLines.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      aria-labelledby="okay-online-heading"
      className="border-b border-border/60 bg-navy px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image: first on mobile, right on desktop */}
        <div className="order-first lg:order-last">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border shadow-2xl shadow-navy-deep/50">
            <Image
              src="/okay-online-shopping.png"
              alt="Yon fanm ayisyen nan Okay k ap achte sou entènèt sou telefòn li pandan NGS ap resevwa koli yo nan Florid epi yon avyon cargo ap pote yo ale pou Okay"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="order-last lg:order-first">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Sèvis pou moun Okay
          </p>
          <h2
            id="okay-online-heading"
            className="mt-3 font-display text-2xl font-bold text-balance text-foreground sm:text-4xl"
          >
            Moun Okay, achte sou entènèt avèk adrès NGS
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Ou rete Okay? Achte pwodwi ou sou entènèt epi voye yo nan adrès NGS nan Florid. NGS ap
            resevwa koli ou, prepare li epi voye li pa Air Cargo pou Okay. Lè koli a rive epi li pare,
            n ap kontakte w pou vin pran li nan biwo NGS sou Route de Simon, anvan Kolèj Evanjelik la.
          </p>

          {/* Steps */}
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium leading-snug text-foreground">{step}</span>
              </li>
            ))}
          </ol>

          {/* Address card */}
          <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                Adrès NGS nan Florid
              </p>
            </div>
            <address className="mt-3 not-italic">
              {addressLines.map((line) => (
                <span key={line} className="block font-display text-lg font-semibold text-foreground">
                  {line}
                </span>
              ))}
            </address>
            <button
              type="button"
              onClick={copyAddress}
              aria-live="polite"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  Adrès la kopye!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
                  Kopye adrès la
                </>
              )}
            </button>
          </div>

          {/* Important note */}
          <p className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Anvan premye acha ou, kontakte NGS pou konfime kijan pou mete non ou ak referans kliyan ou
            sou koli a. Itilize adrès NGS kòm Shipping Address sèlman. Pou Billing Address, itilize
            adrès ki asosye ak mwayen peman ou.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
            >
              <UserPlus className="h-5 w-5" aria-hidden="true" />
              Kreye kont mwen
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Horizontal contact row: WhatsApp + Rele NGS */}
          <div className="mt-4 flex items-center gap-3">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat sou WhatsApp"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={site.phoneHref}
              aria-label={`Rele NGS nan ${site.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Rele NGS
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
