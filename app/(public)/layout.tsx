import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FloatingActions } from "@/components/floating-actions"
import { getCustomerSession } from "@/lib/session"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCustomerSession()

  return (
    <>
      <Navbar customer={customer} />
      <main>{children}</main>
      <Footer />
      <FloatingActions />
    </>
  )
}
