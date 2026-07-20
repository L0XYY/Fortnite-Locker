import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone, alpha, cn } from "@/lib/utils";

export function RarityBadge({
  cosmetic,
  className,
}: {
  cosmetic: Pick<Cosmetic, "rarity" | "rarityLabel" | "series">;
  className?: string;
}) {
  const tone = cosmeticTone(cosmetic);
  const label = cosmetic.series || cosmetic.rarityLabel;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{ background: alpha(tone.color, 0.16), color: tone.color, border: `1px solid ${alpha(tone.color, 0.35)}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.color }} />
      {label}
    </span>
  );
}
