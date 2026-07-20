"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio } from "@/store/useStudio";
import { SLOTS } from "@/lib/utils";
import { LockerStage } from "@/components/locker/LockerStage";
import { RatingCard } from "@/components/locker/RatingCard";
import { CosmeticImage } from "@/components/CosmeticImage";
import { RarityBadge } from "@/components/RarityBadge";
import { VBucks } from "@/components/VBucks";
import { RealMoney } from "@/components/currency";

export function SharedLockerView({ loadout }: { loadout: Record<string, Cosmetic | null> }) {
  const router = useRouter();
  const applyLoadout = useStudio((s) => s.applyLoadout);

  const items = SLOTS.map((s) => loadout[s.key]).filter((c): c is Cosmetic => !!c);
  const value = items.reduce((sum, c) => sum + (c.price || 0), 0);

  function openInStudio() {
    applyLoadout(loadout);
    router.push("/locker");
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Shared locker</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {loadout.outfit?.name || "Custom Loadout"}
          </h1>
        </div>
        <button onClick={openInStudio} className="btn-primary">
          <Wand2 className="h-4 w-4" /> Open in Studio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LockerStage loadout={loadout} />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Contents</p>
            <div className="mt-3 space-y-2">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/cosmetic/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-2 transition hover:bg-white/[0.05]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5">
                    <CosmeticImage cosmetic={c} className="h-full w-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-white/45">{c.typeLabel}</p>
                  </div>
                  <RarityBadge cosmetic={c} />
                </Link>
              ))}
            </div>
            {value > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-sm">
                <span className="text-white/45">Shop value (today)</span>
                <span className="text-right">
                  <VBucks amount={value} className="text-base" />
                  <RealMoney vbucks={value} className="block text-[11px]" />
                </span>
              </div>
            )}
          </div>
          <RatingCard loadout={loadout} />
        </div>
      </div>
    </div>
  );
}
