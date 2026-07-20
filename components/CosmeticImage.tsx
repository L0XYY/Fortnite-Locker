"use client";

import { useState } from "react";
import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone, alpha, cn } from "@/lib/utils";

/** Rarity-tinted image tile with a shimmer skeleton and fade-in. */
export function CosmeticImage({
  cosmetic,
  variant = "icon",
  className,
  imgClassName,
  eager,
}: {
  cosmetic: Pick<Cosmetic, "image" | "featured" | "name" | "rarity" | "series">;
  variant?: "icon" | "featured";
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const tone = cosmeticTone(cosmetic);
  const src = variant === "featured" ? cosmetic.featured || cosmetic.image : cosmetic.image;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 50% 12%, ${alpha(tone.color, 0.42)}, ${alpha(
          tone.color,
          0.06,
        )} 60%, rgba(0,0,0,0.25))`,
      }}
    >
      {!loaded && <div className="shimmer absolute inset-0 bg-white/[0.03]" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={cosmetic.name}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-contain transition-all duration-500",
          loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          imgClassName,
        )}
        draggable={false}
      />
    </div>
  );
}
