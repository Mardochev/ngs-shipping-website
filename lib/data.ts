import { Plane, Package, Radar, Building2 } from "lucide-react"

export const services = [
  {
    icon: Plane,
    title: "Air Cargo",
    description:
      "Reliable air cargo delivering your shipments from Florida to Haiti, with estimated delivery in 5\u201310 business days.",
  },
  {
    icon: Package,
    title: "Package Delivery",
    description:
      "Send parcels, documents, and care packages with reliable door-to-door and pickup-point delivery across Haiti.",
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
    title: "Drop Off or Pickup",
    description: "Bring your items to our Pompano Beach facility or schedule a convenient pickup.",
  },
  {
    step: "03",
    title: "We Ship & Track",
    description: "We pack, document, and dispatch your cargo, giving you a tracking number to follow along.",
  },
  {
    step: "04",
    title: "Delivered in Haiti",
    description: "Your shipment arrives safely and is ready for pickup or door-to-door delivery in Haiti.",
  },
] as const

export const pricingPlans = [
  {
    name: "Standard Air",
    price: "$3.50",
    unit: "per lb",
    description: "Reliable air cargo for everyday packages and personal shipments to Haiti.",
    features: [
      "Standard air cargo",
      "Package & parcel shipping",
      "Tracking included",
      "Pickup point delivery",
      "Affordable flat handling",
    ],
    highlighted: false,
  },
  {
    name: "Express Air",
    price: "$4.50",
    unit: "per lb",
    description: "Our fastest option for urgent packages and time-sensitive cargo.",
    features: [
      "Priority air cargo",
      "Priority handling",
      "Full insurance coverage",
      "Real-time tracking",
      "Door-to-door available",
    ],
    highlighted: true,
  },
  {
    name: "Commercial",
    price: "Custom",
    unit: "by weight",
    description: "For businesses and large-volume commercial air cargo shipments.",
    features: [
      "Volume air cargo rates",
      "Commercial freight",
      "Customs documentation",
      "Dedicated account manager",
      "Scheduled recurring shipments",
    ],
    highlighted: false,
  },
] as const
