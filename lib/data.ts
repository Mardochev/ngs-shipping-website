import { Ship, Plane, Package, Car, Boxes, Truck } from "lucide-react"

export const services = [
  {
    icon: Ship,
    title: "Ocean Freight",
    description:
      "Affordable container and LCL ocean shipping for large loads, furniture, and bulk cargo bound for Haiti.",
  },
  {
    icon: Plane,
    title: "Air Freight",
    description:
      "Express air cargo delivering urgent shipments from the USA to Port-au-Prince in as little as 48 hours.",
  },
  {
    icon: Boxes,
    title: "Barrel Shipping",
    description:
      "The classic way to send food, clothing, and household goods to family. We supply, pack, and ship your barrels.",
  },
  {
    icon: Car,
    title: "Vehicle Shipping",
    description:
      "Cars, trucks, and motorcycles shipped safely with roll-on/roll-off and container options to Haitian ports.",
  },
  {
    icon: Package,
    title: "Package Delivery",
    description:
      "Send small parcels and documents with reliable door-to-door and pickup-point delivery across Haiti.",
  },
  {
    icon: Truck,
    title: "Door-to-Door",
    description:
      "Full-service logistics from your address in the USA all the way to the recipient's door in Haiti.",
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
    name: "Barrel",
    price: "$95",
    unit: "per barrel",
    description: "Best for sending food, clothing, and everyday household goods to loved ones.",
    features: [
      "Standard 55-gallon barrel",
      "Ocean freight to Haiti",
      "Up to 2-3 weeks transit",
      "Tracking included",
      "Pickup point delivery",
    ],
    highlighted: false,
  },
  {
    name: "Express Air",
    price: "$4.50",
    unit: "per lb",
    description: "Our fastest option for urgent packages and time-sensitive cargo.",
    features: [
      "48-hour air freight",
      "Priority handling",
      "Full insurance coverage",
      "Real-time tracking",
      "Door-to-door available",
    ],
    highlighted: true,
  },
  {
    name: "Ocean Cargo",
    price: "Custom",
    unit: "by volume",
    description: "For vehicles, furniture, and large-volume commercial shipments.",
    features: [
      "Container & LCL options",
      "Vehicle shipping",
      "Commercial freight",
      "Customs documentation",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
] as const
