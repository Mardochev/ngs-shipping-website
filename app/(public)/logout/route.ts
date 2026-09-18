import { NextResponse } from "next/server"
import { CUSTOMER_COOKIE } from "@/lib/session"

export const dynamic = "force-dynamic"

// Stable logout endpoint. Using a GET route handler (instead of a server
// action) means the logout URL never changes between deployments, so the
// button keeps working even on dashboard tabs rendered by an older build.
export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url))
  res.cookies.delete(CUSTOMER_COOKIE)
  return res
}
