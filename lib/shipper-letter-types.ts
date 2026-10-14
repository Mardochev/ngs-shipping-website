export const SHIPPER_LETTER_STATUSES = ["New", "Processing", "Completed", "Cancelled"] as const
export type ShipperLetterStatus = (typeof SHIPPER_LETTER_STATUSES)[number]

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
  created_at: string
  updated_at: string
}
