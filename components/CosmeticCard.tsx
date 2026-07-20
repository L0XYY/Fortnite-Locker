import Link from "next/link";
import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone, alpha } from "@/lib/utils";
import { CosmeticImage } from "@/components/CosmeticImage";
import { CosmeticActions } from "@/components/CosmeticActions";
import { VBucks } from "@/components/VBucks";

export function CosmeticCard({ cosmetic }: { cosmetic: Cosmetic }) {
  const tone = cosmeticTone(cosmetic);
  return (
    <Link
      href={`/cosmetic/${cosmetic.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.05]"
      style={{ boxShadow: `0 0 0 0 ${alpha(tone.color, 0)}` }}
    >
      <div className="relative aspect-square">
        <CosmeticImage cosmetic={cosmetic} className="h-full w-full" />

        {/* rarity glow that appears on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 -40px 60px -30px ${alpha(tone.color, 0.9)}` }}
        />

        {cosmetic.inShopToday && cosmetic.price != null && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] backdrop-blur">
            <VBucks amount={cosmetic.price} />
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <CosmeticActions cosmetic={cosmetic} compact />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: tone.color }} />
      </div>

      <div className="flex items-start justify-between gap-2 px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{cosmetic.name}</p>
          <p className="mt-0.5 truncate text-xs text-white/45">
            {cosmetic.series || cosmetic.typeLabel}
          </p>
        </div>
        <span
          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
          style={{ background: tone.color }}
          title={cosmetic.rarityLabel}
        />
      </div>
    </Link>
  );
}
