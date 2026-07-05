import Link from "next/link"
import { Plane, Phone, MessageCircle, Mail, MapPin } from "lucide-react"
import { navLinks, site } from "@/lib/site"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-navy-deep">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Plane className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                  NGS
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  NEXTLANE GLOBAL SHIPPING
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.tagline}. Trusted by families and businesses across the United States.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>Air Cargo</li>
              <li>Package Delivery</li>
              <li>Tracking Services</li>
              <li>Commercial Shipments</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={site.phoneHref} className="flex items-start gap-2.5 transition-colors hover:text-primary">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-primary"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  WhatsApp: {site.whatsappNumber}
                </a>
              </li>
              <li>
                <a href={site.emailHref} className="flex items-start gap-2.5 transition-colors hover:text-primary">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                {site.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            {"\u00A9"} {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Proudly serving the Haiti {"\u{1F1ED}\u{1F1F9}"} community.
          </p>
        </div>
      </div>
    </footer>
  )
}
