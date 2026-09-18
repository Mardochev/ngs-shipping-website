"use server"

import { revalidatePath } from "next/cache"
import { getServiceClient } from "@/lib/supabase/admin"
import { getAdminSession } from "@/lib/session"
import {
  MANIFEST_DESTINATIONS,
  MANIFEST_STATUSES,
  MANIFEST_TO_PACKAGE_STATUS,
  type ManifestStatus,
} from "@/lib/types"

type ActionResult = { error?: string; success?: string; manifestId?: string }

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

function pad(num: number, len = 4) {
  return String(num).padStart(len, "0")
}

async function nextManifestCounter() {
  const supabase = getServiceClient()
  const { data, error } = await supabase.rpc("next_counter", { counter_name: "manifest" } as never)
  if (error) throw error
  return Number(data)
}

// Recompute a manifest's aggregate totals from its member packages.
async function recalcTotals(manifestId: string) {
  const supabase = getServiceClient()
  const { data: pkgs } = await supabase
    .from("packages")
    .select("weight_lb, declared_value, quantity")
    .eq("manifest_id", manifestId)

  const rows = (pkgs ?? []) as { weight_lb: number; declared_value: number; quantity: number }[]
  const totalPackages = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
  const totalWeight = Math.round(rows.reduce((sum, r) => sum + (Number(r.weight_lb) || 0), 0) * 100) / 100
  const totalDeclaredValue =
    Math.round(rows.reduce((sum, r) => sum + (Number(r.declared_value) || 0), 0) * 100) / 100

  await supabase
    .from("manifests")
    .update({
      total_packages: totalPackages,
      total_weight: totalWeight,
      total_declared_value: totalDeclaredValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", manifestId)
}

// Create a new manifest from a set of selected packages.
export async function createManifest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const destination = String(formData.get("destination") ?? "").trim()
  const shipmentDate = String(formData.get("shipment_date") ?? "").trim()
  const carrier = String(formData.get("carrier") ?? "").trim()
  const flightNumber = String(formData.get("flight_number") ?? "").trim()
  const packageIds = (formData.getAll("package_ids") as string[]).filter(Boolean)

  if (!MANIFEST_DESTINATIONS.includes(destination as (typeof MANIFEST_DESTINATIONS)[number])) {
    return { error: "Please choose a valid destination." }
  }
  if (packageIds.length === 0) {
    return { error: "Select at least one package to add to the manifest." }
  }

  // Safety: every selected package must ship to the manifest's destination, so
  // Okay and Okap packages can never be mixed on the same manifest.
  const { data: destRows } = await supabase
    .from("packages")
    .select("id, destination")
    .in("id", packageIds)
  const mismatched = (destRows ?? []).filter(
    (p) => (p as { destination: string }).destination !== destination,
  )
  if (mismatched.length > 0) {
    return { error: `All packages must ship to ${destination}. Remove packages for other destinations.` }
  }

  // Optional per-package quantity / declared value overrides captured in the builder.
  for (const pid of packageIds) {
    const qtyRaw = formData.get(`qty_${pid}`)
    const valRaw = formData.get(`val_${pid}`)
    const update: Record<string, number> = {}
    if (qtyRaw !== null && String(qtyRaw).trim() !== "") {
      update.quantity = Math.max(1, Math.round(Number(qtyRaw) || 1))
    }
    if (valRaw !== null && String(valRaw).trim() !== "") {
      update.declared_value = Math.max(0, Math.round((Number(valRaw) || 0) * 100) / 100)
    }
    if (Object.keys(update).length > 0) {
      await supabase.from("packages").update(update).eq("id", pid)
    }
  }

  const year = new Date().getFullYear()
  const manifestNumber = `NGS-MAN-${year}-${pad(await nextManifestCounter())}`

  const { data: manifest, error } = await supabase
    .from("manifests")
    .insert({
      manifest_number: manifestNumber,
      destination,
      shipment_date: shipmentDate || null,
      carrier: carrier || null,
      flight_number: flightNumber || null,
      status: "Manifested",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }

  const manifestId = manifest.id as string

  // Attach packages and flip their status to Manifested.
  const { error: attachError } = await supabase
    .from("packages")
    .update({ manifest_id: manifestId, status: "Manifested", updated_at: new Date().toISOString() })
    .in("id", packageIds)
  if (attachError) return { error: attachError.message }

  // Write a tracking event per package so public tracking reflects the change.
  await supabase.from("tracking_events").insert(
    packageIds.map((pid) => ({
      package_id: pid,
      status: "Manifested",
      location: "Pompano Beach, Florida, USA",
      note: `Added to manifest ${manifestNumber}`,
    })),
  )

  await recalcTotals(manifestId)

  revalidatePath("/admin")
  revalidatePath(`/admin/manifests/${manifestId}`)
  return { success: `Manifest ${manifestNumber} created.`, manifestId }
}

// Update manifest header fields.
export async function updateManifest(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const supabase = getServiceClient()

  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing manifest id." }
  const destination = String(formData.get("destination") ?? "").trim()
  const shipmentDate = String(formData.get("shipment_date") ?? "").trim()
  const carrier = String(formData.get("carrier") ?? "").trim()
  const flightNumber = String(formData.get("flight_number") ?? "").trim()

  if (!MANIFEST_DESTINATIONS.includes(destination as (typeof MANIFEST_DESTINATIONS)[number])) {
    return { error: "Please choose a valid destination." }
  }

  const { error } = await supabase
    .from("manifests")
    .update({
      destination,
      shipment_date: shipmentDate || null,
      carrier: carrier || null,
      flight_number: flightNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/manifests/${id}`)
  revalidatePath("/admin")
  return { success: "Manifest updated." }
}

// Change a manifest's status and cascade the member packages' statuses.
export async function updateManifestStatus(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as ManifestStatus
  if (!id || !MANIFEST_STATUSES.includes(status)) return

  const { data: manifest } = await supabase
    .from("manifests")
    .select("manifest_number")
    .eq("id", id)
    .maybeSingle()
  const manifestNumber = (manifest?.manifest_number as string) ?? ""

  await supabase
    .from("manifests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  // Cascade to the member packages.
  const packageStatus = MANIFEST_TO_PACKAGE_STATUS[status]
  const { data: pkgs } = await supabase.from("packages").select("id").eq("manifest_id", id)
  const ids = (pkgs ?? []).map((p) => (p as { id: string }).id)

  if (ids.length > 0) {
    await supabase
      .from("packages")
      .update({ status: packageStatus, updated_at: new Date().toISOString() })
      .eq("manifest_id", id)
    await supabase.from("tracking_events").insert(
      ids.map((pid) => ({
        package_id: pid,
        status: packageStatus,
        location:
          status === "Departed USA"
            ? "Pompano Beach, Florida, USA"
            : status === "Arrived Haiti" || status === "Closed"
              ? "Haiti"
              : null,
        note: `Manifest ${manifestNumber} marked ${status}`,
      })),
    )
  }

  revalidatePath(`/admin/manifests/${id}`)
  revalidatePath("/admin")
}

// Remove a single package from a saved manifest (confirmed on the client).
export async function removePackageFromManifest(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const manifestId = String(formData.get("manifest_id") ?? "")
  const packageId = String(formData.get("package_id") ?? "")
  if (!manifestId || !packageId) return

  await supabase
    .from("packages")
    .update({
      manifest_id: null,
      status: "Ready for Shipment",
      updated_at: new Date().toISOString(),
    })
    .eq("id", packageId)
    .eq("manifest_id", manifestId)

  await supabase.from("tracking_events").insert({
    package_id: packageId,
    status: "Ready for Shipment",
    location: "Pompano Beach, Florida, USA",
    note: "Removed from manifest",
  })

  await recalcTotals(manifestId)
  revalidatePath(`/admin/manifests/${manifestId}`)
  revalidatePath("/admin")
}

// Add more eligible packages to an existing manifest (Edit Manifest flow).
export async function addPackagesToManifest(formData: FormData): Promise<void> {
  await requireAdmin()
  const supabase = getServiceClient()
  const manifestId = String(formData.get("manifest_id") ?? "")
  const packageIds = (formData.getAll("package_ids") as string[]).filter(Boolean)
  if (!manifestId || packageIds.length === 0) return

  const { data: manifest } = await supabase
    .from("manifests")
    .select("manifest_number, status, destination")
    .eq("id", manifestId)
    .maybeSingle()
  const manifestNumber = (manifest?.manifest_number as string) ?? ""
  const manifestStatus = (manifest?.status as ManifestStatus) ?? "Manifested"
  const manifestDestination = (manifest?.destination as string) ?? ""
  const packageStatus = MANIFEST_TO_PACKAGE_STATUS[manifestStatus]

  // Only attach packages that ship to this manifest's destination so Okay and
  // Okap packages can never be mixed together.
  const { data: destRows } = await supabase
    .from("packages")
    .select("id, destination")
    .in("id", packageIds)
  const eligibleIds = (destRows ?? [])
    .filter((p) => (p as { destination: string }).destination === manifestDestination)
    .map((p) => (p as { id: string }).id)
  if (eligibleIds.length === 0) return

  await supabase
    .from("packages")
    .update({ manifest_id: manifestId, status: packageStatus, updated_at: new Date().toISOString() })
    .in("id", eligibleIds)
    .is("manifest_id", null)

  await supabase.from("tracking_events").insert(
    eligibleIds.map((pid) => ({
      package_id: pid,
      status: packageStatus,
      location: "Pompano Beach, Florida, USA",
      note: `Added to manifest ${manifestNumber}`,
    })),
  )

  await recalcTotals(manifestId)
  revalidatePath(`/admin/manifests/${manifestId}`)
  revalidatePath("/admin")
}
