import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret (service-role) key. Never import from client code.
 * When SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set, the site falls back to local JSON files
 * (handy for development), see requests-store.ts and item-edits.ts.
 */
export const IMAGE_BUCKET = process.env.SUPABASE_BUCKET ?? "item-images";

let client: SupabaseClient | null | undefined;
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}

export const usingSupabase = () => supabase() !== null;

export function assertOk<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what} failed: ${res.error.message}`);
  return res.data;
}
