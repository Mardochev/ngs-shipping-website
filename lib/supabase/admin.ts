import { createClient } from "@supabase/supabase-js"

// Server-only Supabase client using the service role key.
// This bypasses RLS, so it must ONLY be imported in server-side code
// (server actions / route handlers) that has already verified the caller's session.
let cached: ReturnType<typeof createClient> | null = null

export function getServiceClient() {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Supabase service environment variables are not configured.")
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cached
}
