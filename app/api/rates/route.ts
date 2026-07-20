import { NextResponse } from "next/server";

// Live USD-based exchange rates, cached for a day. Source: open.er-api.com (free, no key).
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`rates ${res.status}`);
    const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    if (json.result !== "success" || !json.rates) throw new Error("bad rates payload");
    return NextResponse.json(
      { rates: json.rates, updated: json.time_last_update_utc ?? null },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" } },
    );
  } catch (err) {
    console.error("[/api/rates]", err);
    // Fall back to USD-only so the UI still works.
    return NextResponse.json({ rates: { USD: 1 }, updated: null }, { status: 200 });
  }
}
