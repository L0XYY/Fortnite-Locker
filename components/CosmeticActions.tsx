"use client";

import { Check, Heart, Bookmark } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio, useHydrated } from "@/store/useStudio";
import { cn } from "@/lib/utils";

export function CosmeticActions({
  cosmetic,
  compact,
  className,
}: {
  cosmetic: Cosmetic;
  compact?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const owned = useStudio((s) => s.owned.includes(cosmetic.id)) && hydrated;
  const fav = useStudio((s) => s.favorites.includes(cosmetic.id)) && hydrated;
  const wish = useStudio((s) => s.wishlist.includes(cosmetic.id)) && hydrated;
  const { toggleOwned, toggleFavorite, toggleWishlist } = useStudio();

  const size = compact ? "h-8 w-8" : "h-10 w-10";
  const icon = compact ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Btn
        active={owned}
        activeClass="bg-emerald-400 text-ink-950 border-emerald-300"
        label={owned ? "Owned" : "Mark owned"}
        className={size}
        onClick={() => toggleOwned(cosmetic)}
      >
        <Check className={icon} strokeWidth={2.6} />
      </Btn>
      <Btn
        active={fav}
        activeClass="bg-rose-500 text-white border-rose-400"
        label="Favorite"
        className={size}
        onClick={() => toggleFavorite(cosmetic)}
      >
        <Heart className={icon} fill={fav ? "currentColor" : "none"} strokeWidth={2.2} />
      </Btn>
      <Btn
        active={wish}
        activeClass="bg-amber-400 text-ink-950 border-amber-300"
        label="Wishlist"
        className={size}
        onClick={() => toggleWishlist(cosmetic)}
      >
        <Bookmark className={icon} fill={wish ? "currentColor" : "none"} strokeWidth={2.2} />
      </Btn>
    </div>
  );
}

function Btn({
  active,
  activeClass,
  label,
  className,
  onClick,
  children,
}: {
  active: boolean;
  activeClass: string;
  label: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "grid place-items-center rounded-full border transition active:scale-90",
        active ? activeClass : "border-white/12 bg-black/40 text-white/70 hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
