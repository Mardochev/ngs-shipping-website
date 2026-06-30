import "server-only"
import QRCode from "qrcode"

// Module-level cache so a QR code for a given payload is only generated once
// per server instance, then reused across requests/prints.
const cache = new Map<string, string>()

export async function getCachedQrDataUrl(
  payload: string,
  options?: { width?: number; margin?: number },
): Promise<string> {
  const width = options?.width ?? 220
  const margin = options?.margin ?? 1
  const key = `${width}:${margin}:${payload}`

  const existing = cache.get(key)
  if (existing) return existing

  const dataUrl = await QRCode.toDataURL(payload, { width, margin })
  cache.set(key, dataUrl)
  return dataUrl
}
