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
      "Send parcels, documents, and care packages with reliable air cargo to our Okap and Okay pickup locations.",
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
    title: "Drop Off or Schedule a Pickup",
    description:
      "Bring your packages to our Pompano Beach location, or contact us to schedule a convenient pickup. Pickup availability may vary by location.",
  },
  {
    step: "03",
    title: "We Ship & Track",
    description: "We pack, document, and dispatch your cargo, giving you a tracking number to follow along.",
  },
  {
    step: "04",
    title: "Arrives in Haiti",
    description: "Your shipment arrives safely and is ready for pickup at our Okap or Okay location.",
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
      "Cargo insurance options available",
      "Real-time tracking",
      "Priority pickup available",
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
