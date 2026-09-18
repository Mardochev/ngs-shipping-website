"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, Copy, MapPin, MessageCircle, Phone, UserPlus } from "lucide-react"
import { site } from "@/lib/site"

const steps = [
  "Create your NGS account",
  "Shop for your products online",
  "Ship the package to your NGS address in Florida",
  "NGS ships your package to Haiti",
] as const

const addressLines = ["83 NW 15th Pl", "Pompano Beach, FL 33060"] as const

const destinationOptions = ["Les Cayes, Haiti", "Cap-Ha\u00EFtien, Haiti", "Port-au-Prince, Haiti"] as const

export function OkayOnlineShopping() {
  const [copied, setCopied] = useState(false)
  const [destination, setDestination] = useState<(typeof destinationOptions)[number]>(destinationOptions[0])

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
              alt="A customer shopping online on their phone while NGS receives the packages in Florida and a cargo plane carries them to Haiti"
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
            Online shopping, shipped to Haiti
          </p>
          <h2
            id="okay-online-heading"
            className="mt-3 font-display text-2xl font-bold text-balance text-foreground sm:text-4xl"
          >
            Shop online and ship it to your NGS address.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Shop for your products online and send them to your NGS address in Florida. NGS receives
            your package, prepares it, and ships it by air cargo to the destination you choose. When
            your package arrives and is ready, we will contact you.
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

          {/* Required destination selector */}
          <div className="mt-8">
            <label
              htmlFor="okay-destination"
              className="text-sm font-semibold uppercase tracking-wider text-primary"
            >
              Choose your destination <span className="text-apricot-light">*</span>
            </label>
            <select
              id="okay-destination"
              name="destination"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value as (typeof destinationOptions)[number])}
              className="mt-2 w-full rounded-lg border border-input bg-navy-deep px-3 py-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none sm:max-w-xs"
            >
              {destinationOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Address card */}
          <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                NGS address in Florida
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
                  Address copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
                  Copy address
                </>
              )}
            </button>
          </div>

          {/* Pickup note */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              <p className="font-display text-sm font-bold text-foreground">Pickup in Haiti</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pickup details will be provided directly to the recipient when the shipment is ready.
            </p>
          </div>

          {/* Important note */}
          <p className="mt-6 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Before your first purchase, contact NGS to confirm how to put your name and customer
            reference on the package. Use the NGS address as the Shipping Address only. For the Billing
            Address, use the address associated with your payment method.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/register?destination=${encodeURIComponent(destination)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
            >
              <UserPlus className="h-5 w-5" aria-hidden="true" />
              Create my account
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Horizontal contact row: WhatsApp + Call NGS */}
          <div className="mt-4 flex items-center gap-3">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={site.callHref}
              aria-label={`Call NGS at ${site.callNumber}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call NGS
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
