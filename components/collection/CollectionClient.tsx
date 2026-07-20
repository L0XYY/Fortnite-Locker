"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Heart, Bookmark, ArrowRight } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio, useHydrated } from "@/store/useStudio";
import { TYPE_LABELS, cn } from "@/lib/utils";
import { CosmeticCard } from "@/components/CosmeticCard";
import { StatTile } from "@/components/primitives";
import { VBucksCoin } from "@/components/VBucks";
import { RealMoney } from "@/components/currency";

const TABS = [
  { key: "owned", label: "Owned", icon: Layers },
  { key: "wishlist", label: "Wishlist", icon: Bookmark },
  { key: "favorites", label: "Favorites", icon: Heart },
] as const;

const BREAKDOWN = ["outfit", "backpack", "pickaxe", "glider", "emote"];

export function CollectionClient({ total }: { total: number }) {
  const hydrated = useHydrated();
  const owned = useStudio((s) => s.owned);
  const favorites = useStudio((s) => s.favorites);
  const wishlist = useStudio((s) => s.wishlist);
  const catalog = useStudio((s) => s.catalog);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("owned");

  const lists = { owned, wishlist, favorites };
  const resolve = (ids: string[]) => ids.map((id) => catalog[id]).filter((c): c is Cosmetic => !!c);

  const ownedItems = useMemo(() => resolve(owned), [owned, catalog]);
  const value = useMemo(() => ownedItems.reduce((s, c) => s + (c.price || 0), 0), [ownedItems]);
  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of ownedItems) m[c.type] = (m[c.type] || 0) + 1;
    return m;
  }, [ownedItems]);
  const completion = total ? ((owned.length / total) * 100).toFixed(1) : "0";

  const current = resolve(lists[tab]);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-28 rounded-3xl bg-white/[0.03]" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Owned cosmetics" value={owned.length} accent="#5bbb3a" />
        <StatTile
          label="Tracked value"
          value={<span className="inline-flex items-center gap-1.5"><VBucksCoin className="h-6 w-6" />{value.toLocaleString()}</span>}
          sub={<RealMoney vbucks={value} prefix="≈ " className="!text-white/60" />}
          accent="#5ac8f5"
        />
        <StatTile label="Completion" value={`${completion}%`} sub={`of ${total.toLocaleString()} cosmetics`} accent="#b45bff" />
        <StatTile label="On wishlist" value={wishlist.length} accent="#ff8a3d" />
      </div>

      {/* Type breakdown */}
      <div className="glass flex flex-wrap gap-x-8 gap-y-3 rounded-3xl px-5 py-4">
        {BREAKDOWN.map((t) => (
          <div key={t}>
            <p className="font-display text-2xl font-bold tabular-nums">{byType[t] || 0}</p>
            <p className="text-xs text-white/45">{TYPE_LABELS[t] || t}s</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t.key ? "bg-white text-ink-950" : "border border-white/10 bg-white/5 text-white/60 hover:text-white",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
            <span className={cn("rounded-full px-1.5 text-xs", tab === t.key ? "bg-ink-950/10" : "bg-white/10")}>
              {lists[t.key].length}
            </span>
          </button>
        ))}
      </div>

      {current.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {current.map((c) => (
            <CosmeticCard key={c.id} cosmetic={c} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-4xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">Nothing here yet</p>
          <p className="mt-1 text-sm text-white/45">
            Mark cosmetics as {tab === "owned" ? "owned" : `on your ${tab}`} while browsing to build your collection.
          </p>
          <Link href="/browse" className="btn-primary mt-6">
            Browse cosmetics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
