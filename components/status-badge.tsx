import { Clock, Truck, PackageCheck } from "lucide-react"

const config: Record<string, { className: string; icon: typeof Clock }> = {
  Processing: { className: "bg-muted text-muted-foreground border-border", icon: Clock },
  "In Transit": { className: "bg-primary/15 text-primary border-primary/30", icon: Truck },
  Delivered: { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: PackageCheck },
}

export function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? config.Processing
  const Icon = c.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${c.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  )
}
