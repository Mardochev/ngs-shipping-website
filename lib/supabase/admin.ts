import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Server-only Supabase client using the service role key.
// This bypasses RLS, so it must ONLY be imported in server-side code
// (server actions / route handlers) that has already verified the caller's session.
// Typed as `any` schema because we don't generate DB types; queries are validated at runtime.
let cached: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
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
