"use client"

import { useEffect, useRef, useState } from "react"
import { Share2, MessageCircle, MessageSquareText, Link2, Check, ChevronDown } from "lucide-react"

const SHIPPER_LETTER_FORM_URL = "https://ngsshipping.com/shipper-letter"
const SHARE_MESSAGE = `Hello! Please fill out your NEXTLANE GLOBAL SHIPPING (NGS) Shipper Letter here: ${SHIPPER_LETTER_FORM_URL}`

const whatsappHref = `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`
// "sms:?&body=" is understood by both iOS and Android messaging apps.
const smsHref = `sms:?&body=${encodeURIComponent(SHARE_MESSAGE)}`

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API can be blocked (e.g. inside iframes); fall back to a hidden textarea.
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  }
}

const optionClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus:bg-secondary focus:outline-none"

export function ShareFormButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", handlePointer)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("pointerdown", handlePointer)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2500)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    const ok = await copyText(SHIPPER_LETTER_FORM_URL)
    if (ok) setCopied(true)
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="share-form-menu"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share form
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="share-form-menu"
          role="menu"
          className="absolute right-0 z-20 mt-2 w-full min-w-64 rounded-xl border border-border bg-card p-2 shadow-lg sm:w-72"
        >
          <a
            role="menuitem"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={optionClass}
          >
            <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
            WhatsApp
          </a>
          <a role="menuitem" href={smsHref} onClick={() => setOpen(false)} className={optionClass}>
            <MessageSquareText className="h-5 w-5 text-primary" aria-hidden="true" />
            Text message (SMS)
          </a>
          <button type="button" role="menuitem" onClick={handleCopy} className={optionClass}>
            {copied ? (
              <Check className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <Link2 className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy form link"}
          </button>
          <p className="truncate border-t border-border px-3 pb-1 pt-2 font-mono text-xs text-muted-foreground">
            {SHIPPER_LETTER_FORM_URL}
          </p>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  )
}
