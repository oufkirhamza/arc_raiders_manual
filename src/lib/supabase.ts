import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret (service-role) key. Never import from client code.
 * When SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set, the site falls back to local JSON files
 * (handy for development), see requests-store.ts and item-edits.ts.
 */
export const IMAGE_BUCKET = process.env.SUPABASE_BUCKET ?? "item-images";

/**
 * Accepts the Project URL in any common pasted form ("…supabase.co/", "…supabase.co/rest/v1")
 * and keeps only the origin, which is what supabase-js expects.
 */
function projectUrl(raw: string | undefined) {
  if (!raw?.trim()) return undefined;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`SUPABASE_URL is not a valid URL. Use the Project URL, e.g. https://<project-ref>.supabase.co`);
  }
  if (url.hostname === "supabase.com" || url.hostname.endsWith(".supabase.com")) {
    throw new Error(`SUPABASE_URL points to the Supabase dashboard (${url.hostname}). Use the Project URL from Project Settings → API, e.g. https://<project-ref>.supabase.co`);
  }
  return url.origin;
}

let client: SupabaseClient | null | undefined;
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = projectUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}

export const usingSupabase = () => supabase() !== null;

export function assertOk<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Supabase ${what} failed: ${res.error.message}`);
  return res.data;
}
