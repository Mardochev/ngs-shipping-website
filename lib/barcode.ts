// Lightweight, deterministic Code 39 barcode rendered as an inline SVG string.
// Results are cached per value so the same tracking number is never re-encoded,
// and SVG <rect>s print without the expensive rasterization that CSS gradients
// incur at high print DPI (which froze Edge's print pipeline).

const CODE39: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn", "A": "wnnnnwnnw", "B": "nnwnnwnnw",
  "C": "wnwnnwnnn", "D": "nnnnwwnnw", "E": "wnnnwwnnn", "F": "nnwnwwnnn",
  "G": "nnnnnwwnw", "H": "wnnnnwwnn", "I": "nnwnnwwnn", "J": "nnnnwwwnn",
  "K": "wnnnnnnww", "L": "nnwnnnnww", "M": "wnwnnnnwn", "N": "nnnnwnnww",
  "O": "wnnnwnnwn", "P": "nnwnwnnwn", "Q": "nnnnnnwww", "R": "wnnnnnwwn",
  "S": "nnwnnnwwn", "T": "nnnnwnwwn", "U": "wwnnnnnnw", "V": "nwwnnnnnw",
  "W": "wwwnnnnnn", "X": "nwnnwnnnw", "Y": "wwnnwnnnn", "Z": "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
}

const cache = new Map<string, string>()

export function getBarcodeSvg(value: string, opts?: { height?: number }): string {
  const key = `${value}|${opts?.height ?? 40}`
  const cached = cache.get(key)
  if (cached) return cached

  const height = opts?.height ?? 40
  const narrow = 2
  const wide = narrow * 3
  const data = `*${value.toUpperCase().replace(/[^0-9A-Z\-. ]/g, "")}*`

  let x = 0
  const rects: string[] = []
  for (const char of data) {
    const pattern = CODE39[char] ?? CODE39["-"]
    for (let i = 0; i < pattern.length; i++) {
      const width = pattern[i] === "w" ? wide : narrow
      // Even indices are bars (black), odd indices are spaces (white)
      if (i % 2 === 0) {
        rects.push(`<rect x="${x}" y="0" width="${width}" height="${height}" />`)
      }
      x += width
    }
    x += narrow // inter-character gap
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${height}" ` +
    `width="100%" height="100%" preserveAspectRatio="none" ` +
    `shape-rendering="crispEdges" fill="#000">${rects.join("")}</svg>`

  cache.set(key, svg)
  return svg
}
