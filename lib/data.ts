import { Plane, Package, Radar, Building2 } from "lucide-react"

export const services = [
  {
    icon: Plane,
    title: "Air Cargo",
    description:
      "Reliable air cargo delivering your shipments from USA to Haiti, with estimated delivery in 5\u201310 business days.",
  },
  {
    icon: Package,
    title: "Package Delivery",
    description:
      "Send parcels, documents, and care packages with reliable air cargo to Port-au-Prince, Cap-Ha\u00EFtien (Okap) and Les Cayes (Okay).",
  },
  {
    icon: Radar,
    title: "Tracking Services",
    description:
      "Follow every shipment in real time with a tracking number, from drop-off in the USA to delivery in Haiti.",
  },
  {
    icon: Building2,
    title: "Commercial Shipments",
    description:
      "Dependable air cargo solutions for businesses, with customs documentation and dedicated account support.",
  },
] as const

export const steps = [
  {
    step: "01",
    title: "Request a Quote",
    description: "Call us or fill out the contact form with your shipment details for an instant estimate.",
  },
  {
    step: "02",
    title: "Drop Off Your Package",
    description:
      "Bring your packages to our Pompano Beach, Florida location. Our team will receive, weigh, prepare, and process your shipment for Haiti.",
  },
  {
    step: "03",
    title: "We Ship & Track",
    description: "We pack, document, and dispatch your cargo, giving you a tracking number to follow along.",
  },
  {
    step: "04",
    title: "Arrives in Haiti",
    description:
      "Your shipment arrives safely at our Port-au-Prince, Cap-Ha\u00EFtien (Okap), or Les Cayes (Okay) location.",
  },
] as const
