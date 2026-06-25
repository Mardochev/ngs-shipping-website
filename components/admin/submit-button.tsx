"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

export function SubmitButton({
  children,
  className = "",
  pendingText,
}: {
  children: ReactNode
  className?: string
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending && pendingText ? pendingText : children}
    </button>
  )
}
