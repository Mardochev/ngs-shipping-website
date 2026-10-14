import { Plane } from "lucide-react"

// Solid black so it prints crisply on thermal heads. The vertical margin
// keeps a clear quiet zone below the barcode so scanners are not affected.
export function PrintAirplaneIcon({ size = 22 }: { size?: number }) {
  return (
    <div aria-hidden="true" className="flex justify-center py-1 text-black">
      <Plane width={size} height={size} strokeWidth={1.5} fill="currentColor" />
    </div>
  )
}
