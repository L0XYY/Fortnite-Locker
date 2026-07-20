import { NextRequest, NextResponse } from "next/server";
import { queryCosmetics, type Query } from "@/lib/fortnite";

// Server-side filtered + paginated cosmetics feed. Keeps the 15.8k-item
// dataset on the server; the client only ever receives a small page.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const sort = p.get("sort");
  const query: Query = {
    type: p.get("type") || undefined,
    q: p.get("q") || undefined,
    rarity: p.get("rarity") || undefined,
    series: p.get("series") || undefined,
    season: p.get("season") || undefined,
    inShop: p.get("inShop") === "1",
    sort: (sort as Query["sort"]) || "newest",
    page: Number(p.get("page")) || 1,
    limit: Number(p.get("limit")) || 48,
  };

  try {
    const result = await queryCosmetics(query);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[/api/cosmetics]", err);
    return NextResponse.json({ error: "Failed to load cosmetics" }, { status: 502 });
  }
}
