import type { Metadata } from "next";
import Link from "next/link";
import { decodeLoadout } from "@/lib/share";
import { getManyCosmetics } from "@/lib/fortnite";
import { SLOTS } from "@/lib/utils";
import { SharedLockerView } from "@/components/locker/SharedLockerView";
import type { Cosmetic } from "@/lib/fortnite";

export const metadata: Metadata = {
  title: "Shared Locker",
  description: "A Fortnite locker shared from Locker Studio.",
};

export default async function SharedLockerPage({ params }: { params: Promise<{ data: string }> }) {
  const { data } = await params;
  const ids = decodeLoadout(data);
  const slotKeys = Object.keys(ids);
  const cosmetics = await getManyCosmetics(Object.values(ids));
  const byId = new Map(cosmetics.map((c) => [c.id, c]));

  const loadout: Record<string, Cosmetic | null> = {};
  for (const key of SLOTS.map((s) => s.key)) {
    loadout[key] = slotKeys.includes(key) ? byId.get(ids[key]) || null : null;
  }

  const hasAny = Object.values(loadout).some(Boolean);
  if (!hasAny) {
    return (
      <div className="glass mx-auto mt-16 max-w-md rounded-4xl px-6 py-16 text-center">
        <p className="font-display text-xl font-bold">This locker link is invalid</p>
        <p className="mt-2 text-sm text-white/45">The share link may be broken or expired.</p>
        <Link href="/locker" className="btn-primary mt-6">Build your own</Link>
      </div>
    );
  }

  return <SharedLockerView loadout={loadout} />;
}
