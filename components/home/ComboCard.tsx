import Link from "next/link";
import type { Cosmetic } from "@/lib/fortnite";
import { rateLoadout } from "@/lib/rating";
import { encodeLoadout } from "@/lib/share";
import { SLOTS, cosmeticTone, alpha } from "@/lib/utils";
import { CosmeticImage } from "@/components/CosmeticImage";
import { VBucks } from "@/components/VBucks";
import { RealMoney } from "@/components/currency";

export function ComboCard({ loadout }: { loadout: Record<string, Cosmetic | null> }) {
  const outfit = loadout.outfit;
  if (!outfit) return null;
  const tone = cosmeticTone(outfit);
  const rating = rateLoadout(loadout);
  const pieces = SLOTS.map((s) => loadout[s.key]).filter((c): c is Cosmetic => !!c);
  const value = pieces.reduce((sum, c) => sum + (c.price || 0), 0);

  const ids: Record<string, string> = {};
  for (const s of SLOTS) if (loadout[s.key]) ids[s.key] = loadout[s.key]!.id;

  return (
    <Link
      href={`/l/${encodeLoadout(ids)}`}
      className="group relative flex flex-col overflow-hidden rounded-4xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div
        className="relative flex h-64 items-center justify-center"
        style={{ background: `radial-gradient(80% 70% at 50% 20%, ${alpha(tone.color, 0.35)}, transparent 70%)` }}
      >
        <CosmeticImage cosmetic={outfit} variant="featured" className="h-full w-56" imgClassName="drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {pieces.slice(1, 4).map((c) => (
            <span key={c.id} className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur">
              <CosmeticImage cosmetic={c} className="h-full w-full" />
            </span>
          ))}
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold backdrop-blur">
          {rating.score.toFixed(1)} <span className="text-white/50">Combo</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold">{outfit.name}</p>
          <p className="truncate text-xs text-white/45">{pieces.length}-piece · {rating.style}</p>
        </div>
        {value > 0 && (
          <div className="shrink-0 text-right">
            <VBucks amount={value} className="text-sm" />
            <RealMoney vbucks={value} className="block text-[10px]" />
          </div>
        )}
      </div>
    </Link>
  );
}
