"use client"

import { useState } from "react"
import { MessageCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { Modal } from "./modal"
import {
  buildWhatsAppMessage,
  normalizePhone,
  whatsAppLink,
  type WhatsAppShipmentInfo,
} from "@/lib/whatsapp"

type Person = { name: string | null | undefined; phone: string | null | undefined }
type Choice = "shipper" | "recipient" | "both"

const CHOICES: { value: Choice; label: string; hint: string }[] = [
  { value: "shipper", label: "Moun isit", hint: "Ekspeditè a (USA)" },
  { value: "recipient", label: "Moun Ayiti", hint: "Moun k ap resevwa a" },
  { value: "both", label: "Toude", hint: "De mesaj separe" },
]

export function WhatsAppButton({
  info,
  shipper,
  recipient,
  compact = false,
}: {
  info: WhatsAppShipmentInfo
  shipper: Person
  recipient: Person
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<Choice>("recipient")

  const people: { role: string; person: Person }[] = []
  if (choice !== "recipient") people.push({ role: "Moun isit", person: shipper })
  if (choice !== "shipper") people.push({ role: "Moun Ayiti", person: recipient })

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          aria-label={`Voye sou WhatsApp pou ${info.trackingNumber}`}
          title="Voye sou WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Voye sou WhatsApp
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={`Voye sou WhatsApp · ${info.trackingNumber}`}>
        <div className="flex flex-col gap-5 text-left">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-muted-foreground">Ki moun pou voye l bay?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {CHOICES.map((c) => (
                <label
                  key={c.value}
                  className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                    choice === c.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name={`wa-choice-${info.trackingNumber}`}
                    value={c.value}
                    checked={choice === c.value}
                    onChange={() => setChoice(c.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-foreground">{c.label}</span>
                  <span className="text-xs">{c.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <ul className="flex flex-col gap-3">
            {people.map(({ role, person }) => (
              <RecipientCard key={role} role={role} person={person} info={info} />
            ))}
          </ul>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Sa a louvri yon bouyon nan WhatsApp sèlman. Mesaj la pa voye otomatikman: peze Send nan WhatsApp pou voye l.
          </p>
        </div>
      </Modal>
    </>
  )
}

function RecipientCard({ role, person, info }: { role: string; person: Person; info: WhatsAppShipmentInfo }) {
  const name = (person.name ?? "").trim()
  const phone = normalizePhone(person.phone)

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{role}</span>
        <span className="truncate font-semibold text-foreground">{name || "Pa gen non"}</span>
        {phone.ok ? (
          <span className="font-mono text-sm text-foreground">{phone.display}</span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-apricot-light" role="alert">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {person.phone ? `${person.phone} - ${phone.error}` : phone.error}
          </span>
        )}
      </div>
      {phone.ok ? (
        <a
          href={whatsAppLink(phone.e164, buildWhatsAppMessage(name, info))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-apricot-light"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ouvri WhatsApp
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(louvri nan yon nouvo tab)</span>
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Korije nimewo a anvan ou voye.</span>
      )}
    </li>
  )
}
