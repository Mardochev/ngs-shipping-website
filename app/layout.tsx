import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { site } from "@/lib/site"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${site.name} | USA to Haiti Shipping`,
    template: `%s | ${site.shortName}`,
  },
  description:
    "NEXTLANE GLOBAL SHIPPING (NGS) provides fast, secure, and reliable air cargo from the USA to Haiti. Air cargo, package delivery, tracking, and commercial shipments. Your Cargo, Our Priority.",
  keywords: [
    "shipping to Haiti",
    "USA to Haiti shipping",
    "NGS shipping",
    "Haiti cargo",
    "freight forwarding",
    "Pompano Beach shipping",
  ],
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#0a1f44",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
