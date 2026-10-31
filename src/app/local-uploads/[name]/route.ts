import { promises as fs } from "node:fs";
import path from "node:path";
import { LOCAL_DIR } from "@/lib/local-store";
import { usingSupabase } from "@/lib/supabase";

/** Serves images uploaded in local-development mode (no Supabase). Disabled when Supabase is configured. */
const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (usingSupabase()) return new Response("Not found", { status: 404 });
  const name = path.basename((await params).name);
  const type = TYPES[path.extname(name)];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(LOCAL_DIR, "uploads", name));
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
