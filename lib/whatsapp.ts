export const PUBLIC_TRACKING_URL = "https://www.ngsshipping.com/tracking"

export function publicTrackingLink(trackingNumber: string) {
  return `${PUBLIC_TRACKING_URL}?number=${encodeURIComponent(trackingNumber.trim())}`
}

export type PhoneCheck = { ok: true; e164: string; display: string } | { ok: false; error: string }

// Accepts "+1 (754) 555-0123", "754-555-0123", "+509 3412 3456", "3412 3456", "00509…".
// Numbers without a country code are only accepted when they unambiguously match
// a US (10 digits) or Haiti (8 digits) local number.
export function normalizePhone(raw: string | null | undefined): PhoneCheck {
  const input = (raw ?? "").trim()
  if (!input) return { ok: false, error: "Pa gen nimewo telefòn." }
  if (/[^\d\s()+.\-]/.test(input)) return { ok: false, error: "Nimewo a gen karaktè ki pa valab." }

  let digits = input.replace(/\D/g, "")
  const hasPlus = input.startsWith("+")
  if (!hasPlus && digits.startsWith("00")) digits = digits.slice(2)
  else if (!hasPlus) {
    if (digits.length === 10) digits = `1${digits}`
    else if (digits.length === 8) digits = `509${digits}`
    else if (!(digits.length === 11 && digits.startsWith("1")) && !(digits.length === 11 && digits.startsWith("509"))) {
      return { ok: false, error: "Ajoute kòd peyi a (egz. +1 oswa +509)." }
    }
  }

  if (digits.startsWith("1")) {
    if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return { ok: false, error: "Nimewo USA/Kanada (+1) pa valab." }
    return { ok: true, e164: digits, display: `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}` }
  }
  if (digits.startsWith("509")) {
    if (!/^509[2-5]\d{7}$/.test(digits)) return { ok: false, error: "Nimewo Ayiti (+509) dwe gen 8 chif apre +509." }
    return { ok: true, e164: digits, display: `+509 ${digits.slice(3, 7)} ${digits.slice(7)}` }
  }
  if (!/^[1-9]\d{7,14}$/.test(digits)) return { ok: false, error: "Nimewo entènasyonal la pa valab." }
  return { ok: true, e164: digits, display: `+${digits}` }
}

const STATUS_KREYOL: Record<string, { label: string; explanation: string }> = {
  Processing: { label: "Ap trete", explanation: "Nou resevwa koli w la epi n ap prepare l." },
  "Ready for Shipment": { label: "Pare pou ekspedye", explanation: "Koli w la pare pou l pati nan pwochen vòl la." },
  Manifested: { label: "Sou manifès", explanation: "Koli w la anrejistre sou lis vòl la." },
  "Departed USA": { label: "Kite USA", explanation: "Koli w la kite Etazini, li an wout pou Ayiti." },
  "In Transit": { label: "An wout", explanation: "Koli w la an wout." },
  "Arrived Haiti": { label: "Rive Ayiti", explanation: "Koli w la rive Ayiti." },
  "Ready for Pickup": { label: "Pare pou retire", explanation: "Koli w la pare, ou ka vin chèche l." },
  Delivered: { label: "Livre", explanation: "Koli w la livre." },
  // Shipper Letter statuses used when no tracking status has been set yet.
  New: { label: "Resevwa", explanation: "NGS resevwa lèt ekspedisyon w lan." },
  Completed: { label: "Fini", explanation: "Ekspedisyon w lan fini." },
  Cancelled: { label: "Anile", explanation: "Ekspedisyon sa a anile." },
}

export function describeStatusKreyol(status: string) {
  return STATUS_KREYOL[status] ?? { label: status, explanation: "" }
}

// Dates are stored as YYYY-MM-DD; format without a Date object to avoid timezone shifts.
function formatDateKreyol(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "")
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null
}

export type WhatsAppShipmentInfo = {
  trackingNumber: string
  status: string
  destination: string
  estimatedDelivery: string | null
}

// Letters use their saved tracking status, falling back to the letter workflow status.
export function letterWhatsAppInfo(letter: {
  reference_number: string
  tracking_status: string | null
  status: string
  destination_city: string
  estimated_delivery_date: string | null
}): WhatsAppShipmentInfo {
  return {
    trackingNumber: letter.reference_number,
    status: letter.tracking_status ?? letter.status,
    destination: letter.destination_city ? `${letter.destination_city}, Haiti` : "Haiti",
    estimatedDelivery: letter.estimated_delivery_date,
  }
}

export function shipmentWhatsAppInfo(shipment: {
  tracking_number: string
  status: string
  destination: string
  estimated_delivery: string | null
}): WhatsAppShipmentInfo {
  return {
    trackingNumber: shipment.tracking_number,
    status: shipment.status,
    destination: shipment.destination,
    estimatedDelivery: shipment.estimated_delivery,
  }
}

export function buildWhatsAppMessage(name: string, info: WhatsAppShipmentInfo) {
  const { label, explanation } = describeStatusKreyol(info.status)
  const eta = formatDateKreyol(info.estimatedDelivery)
  const greeting = name.trim() ? `Bonjou ${name.trim()},` : "Bonjou,"
  return [
    greeting,
    "Se NGS Nextlane Global Shipping.",
    "",
    `Nimewo swivi: ${info.trackingNumber}`,
    `Destinasyon: ${info.destination}`,
    `Estati: ${label}${explanation ? ` - ${explanation}` : ""}`,
    ...(eta ? [`Dat livrezon estime: ${eta}`] : []),
    "",
    `Swiv koli w la isit: ${publicTrackingLink(info.trackingNumber)}`,
    "",
    "Mèsi paske w fè NGS konfyans!",
  ].join("\n")
}

export function whatsAppLink(e164: string, message: string) {
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`
}
