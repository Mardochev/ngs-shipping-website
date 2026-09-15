import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import {
  listShipments,
  listCustomers,
  getSettings,
  listManifests,
  listManifestEligiblePackages,
  listDestinationRates,
} from "@/lib/queries"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")

  const [shipments, customers, settings, manifests, eligiblePackages, destinationRates] = await Promise.all([
    listShipments(),
    listCustomers(),
    getSettings(),
    listManifests(),
    listManifestEligiblePackages(),
    listDestinationRates(),
  ])

  return (
    <AdminDashboard
      adminName={session.name ?? session.email}
      shipments={shipments}
      customers={customers}
      settings={settings}
      manifests={manifests}
      eligiblePackages={eligiblePackages}
      destinationRates={destinationRates}
    />
  )
}
