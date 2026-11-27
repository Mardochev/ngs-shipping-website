import type { ShipmentStatus } from "@/lib/types"

export const SHIPPER_LETTER_STATUSES = ["New", "Processing", "Completed", "Cancelled"] as const
export type ShipperLetterStatus = (typeof SHIPPER_LETTER_STATUSES)[number]

export function formatShipperAddressLines(letter: {
  shipper_street: string
  shipper_city: string
  shipper_state: string
  shipper_zip: string
}): string[] {
  const cityLine = [letter.shipper_city, [letter.shipper_state, letter.shipper_zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
  return [letter.shipper_street, cityLine].filter(Boolean)
}

export const SHIPPER_LETTER_DESTINATIONS = ["Les Cayes", "Cap-Haïtien", "Port-au-Prince"] as const

export type ShipperLetter = {
  id: string
  reference_number: string
  shipper_full_name: string
  shipper_phone: string
  shipper_email: string
  shipper_street: string
  shipper_city: string
  shipper_state: string
  shipper_zip: string
  recipient_full_name: string
  recipient_phone: string
  destination_city: string
  package_description: string
  number_of_packages: number
  total_weight: number
  declared_value: number
  special_instructions: string | null
  agreed_terms: boolean
  signature: string
  signed_date: string
  status: ShipperLetterStatus
  tracking_status: ShipmentStatus | null
  price: number | null
  fees: number | null
  total: number | null
  estimated_delivery_date: string | null
  packages: ShipperLetterPackage[] | null
  fixed_items: ShipperLetterFixedItem[] | null
  payment_history_verified: boolean
  created_at: string
  updated_at: string
}

export type ShipperLetterPackage = {
  description: string
  weight: number
}

export const MAX_LETTER_PACKAGES = 100

// Letters saved before package rows existed only have the combined columns.
// An empty array is valid: a letter may contain only fixed-price items.
export function getLetterPackages(letter: {
  packages: ShipperLetterPackage[] | null
  package_description: string
  total_weight: number
}): ShipperLetterPackage[] {
  if (Array.isArray(letter.packages)) {
    return letter.packages.map((p) => ({ description: String(p.description ?? ""), weight: Number(p.weight) || 0 }))
  }
  return [{ description: letter.package_description, weight: Number(letter.total_weight) || 0 }]
}

export function sumPackageWeight(packages: ShipperLetterPackage[]) {
  return Math.round(packages.reduce((sum, p) => sum + (Number(p.weight) || 0), 0) * 100) / 100
}

// Fixed-price items (e.g. TVs, phones) are billed per item, never by the pound.
// `weight` is the actual weight of the whole line (all units), kept for the manifest.
// When `in_existing_box` is true the item sits inside one of the package rows, so its
// weight is already in that box's scale weight and it adds no physical package.
export type ShipperLetterFixedItem = {
  description: string
  quantity: number
  unit_price: number
  weight: number
  in_existing_box: boolean
}

export const MAX_LETTER_FIXED_ITEMS = 50

const round2 = (n: number) => Math.round(n * 100) / 100

export function getLetterFixedItems(letter: { fixed_items: ShipperLetterFixedItem[] | null }): ShipperLetterFixedItem[] {
  if (!Array.isArray(letter.fixed_items)) return []
  return letter.fixed_items.map((i) => ({
    description: String(i.description ?? ""),
    quantity: Number(i.quantity) || 0,
    unit_price: Number(i.unit_price) || 0,
    weight: Number(i.weight) || 0,
    in_existing_box: i.in_existing_box === true,
  }))
}

export function fixedItemCharge(item: Pick<ShipperLetterFixedItem, "quantity" | "unit_price">) {
  return round2(item.quantity * item.unit_price)
}

export function fixedItemsCharge(items: Pick<ShipperLetterFixedItem, "quantity" | "unit_price">[]) {
  return round2(items.reduce((sum, i) => sum + fixedItemCharge(i), 0))
}

// Single source for counts and weights so the form, letter, receipt and manifest agree.
export function computeLetterLoad(
  packages: Pick<ShipperLetterPackage, "weight">[],
  fixedItems: Pick<ShipperLetterFixedItem, "quantity" | "unit_price" | "weight" | "in_existing_box">[],
) {
  const parcelWeight = round2(packages.reduce((sum, p) => sum + (Number(p.weight) || 0), 0))
  const inBoxWeight = round2(fixedItems.reduce((sum, i) => sum + (i.in_existing_box ? i.weight : 0), 0))
  const ownBoxWeight = round2(fixedItems.reduce((sum, i) => sum + (i.in_existing_box ? 0 : i.weight), 0))
  const ownBoxCount = fixedItems.reduce((sum, i) => sum + (i.in_existing_box ? 0 : i.quantity), 0)
  return {
    packageCount: packages.length + ownBoxCount,
    totalWeight: round2(parcelWeight + ownBoxWeight),
    perLbWeight: Math.max(0, round2(parcelWeight - inBoxWeight)),
    fixedCharge: fixedItemsCharge(fixedItems),
  }
}

export const PAYMENT_CURRENCIES = ["USD", "HTG"] as const
export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[number]

export const PAYMENT_LOCATIONS = ["USA", "Haiti"] as const
export type PaymentLocation = (typeof PAYMENT_LOCATIONS)[number]

export const PAYMENT_METHODS = ["Cash", "Zelle", "Cash App", "Card", "MonCash", "NatCash", "Bank transfer", "Other"] as const

export type ShipperLetterPayment = {
  id: string
  shipper_letter_id: string
  amount: number
  currency: PaymentCurrency
  location: PaymentLocation
  payment_date: string
  method: string
  exchange_rate: number | null
  amount_usd: number
  created_at: string
}

export type LetterPaymentStatus = "Unpaid" | "Partially Paid" | "Paid" | "Payment to verify"

export const PAYMENT_TO_VERIFY = "Payment to verify"

const cents = (n: number) => Math.round(n * 100) / 100

// The invoice total is what is owed; only recorded payments count as paid.
// Letters created before payment history existed may have been paid outside the app,
// so until an admin confirms their history the balance is not presented as confirmed.
export function summarizeLetterPayments(
  total: number | null,
  payments: Pick<ShipperLetterPayment, "amount_usd">[],
  historyVerified = true,
) {
  const totalPaid = cents(payments.reduce((sum, p) => sum + Number(p.amount_usd), 0))
  const invoiceTotal = total === null || total === undefined ? null : cents(Number(total))
  const balanceDue = invoiceTotal === null ? null : Math.max(0, cents(invoiceTotal - totalPaid))
  let status: LetterPaymentStatus = "Unpaid"
  if (!historyVerified) status = PAYMENT_TO_VERIFY
  else if (invoiceTotal !== null && invoiceTotal > 0 && balanceDue === 0) status = "Paid"
  else if (totalPaid > 0) status = "Partially Paid"
  return { invoiceTotal, totalPaid, balanceDue, status, balanceConfirmed: historyVerified }
}

const usdAmount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const htgAmount = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatPaymentAmount(p: Pick<ShipperLetterPayment, "amount" | "currency">) {
  const amount = Number(p.amount)
  return p.currency === "HTG" ? `${htgAmount.format(amount)} HTG` : usdAmount.format(amount)
}
