import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/session"
import { getAdminCount } from "@/lib/queries"
import { AdminLoginForm } from "@/components/admin/admin-login-form"

export const metadata: Metadata = {
  title: "Admin Login | NGS Shipping",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await getAdminSession()
  if (session) redirect("/admin")

  const adminCount = await getAdminCount()

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-navy-deep px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(245,166,35,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <AdminLoginForm needsBootstrap={adminCount === 0} />
    </main>
  )
}
