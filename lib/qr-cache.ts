import "server-only"
import QRCode from "qrcode"

// Module-level cache so a QR code for a given payload is only generated once
// per server instance, then reused across requests/prints.
const cache = new Map<string, string>()

type QrOptions = {
  width?: number
  margin?: number
  dark?: string
  light?: string
}

// Generates the QR as an SVG (vector) instead of a PNG data URL. SVG generation
// skips the expensive PNG raster/zlib encoding that `toDataURL` performs, which
// is the main cold-start cost the print pages pay from the `qrcode` package.
// Returned as an SVG data URL so existing `<img src={...}>` markup is unchanged.
export async function getCachedQrDataUrl(payload: string, options?: QrOptions): Promise<string> {
  const width = options?.width ?? 220
  const margin = options?.margin ?? 1
  const dark = options?.dark ?? "#000000"
  const light = options?.light ?? "#ffffff"
  const key = `${width}:${margin}:${dark}:${light}:${payload}`

  const existing = cache.get(key)
  if (existing) return existing

  const svg = await QRCode.toString(payload, {
    type: "svg",
    width,
    margin,
    color: { dark, light },
  })
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  cache.set(key, dataUrl)
  return dataUrl
}
