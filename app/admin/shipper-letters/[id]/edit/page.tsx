import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAdminSession } from "@/lib/session"
import { getShipperLetterById } from "@/lib/shipper-letter-queries"
import { ShipperLetterEditForm } from "@/components/admin/shipper-letter-edit-form"

export const dynamic = "force-dynamic"

export default async function EditShipperLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const { id } = await params
  const letter = await getShipperLetterById(id)
  if (!letter) notFound()

  return (
    <main className="min-h-screen bg-navy-deep px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href={`/admin/shipper-letters/${letter.id}`}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Shipper Letter
        </Link>

        <header className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Edit Shipper Letter</h1>
          <p className="text-sm text-muted-foreground">
            Reference <span className="font-mono font-semibold text-foreground">{letter.reference_number}</span>{" "}
            stays the same. To change price, assurance fee, status, or delivery date, use the controls on the Shipper
            Letter page.
          </p>
        </header>

        <ShipperLetterEditForm letter={letter} />
      </div>
    </main>
  )
}
