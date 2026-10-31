import { buildSearchIndex } from "@/lib/search-index";
import { getData } from "@/lib/live-data";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(buildSearchIndex(await getData()), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
