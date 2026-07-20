"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { rateLoadout } from "@/lib/rating";

export function RatingCard({ loadout }: { loadout: Record<string, Cosmetic | null | undefined> }) {
  const rating = useMemo(() => rateLoadout(loadout), [loadout]);
  const pct = (rating.score / 10) * 100;

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/45">
        <Sparkles className="h-4 w-4" />
        Combo Score
      </div>

      <div className="mt-3 flex items-end gap-3">
        <motion.span
          key={rating.score}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-bold leading-none tabular-nums"
        >
          {rating.score.toFixed(1)}
        </motion.span>
        <span className="pb-1 text-sm text-white/40">/ 10</span>
        <span className="ml-auto rounded-full bg-white/8 px-3 py-1 text-xs font-semibold">{rating.style}</span>
      </div>

      {/* meter */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="mt-3 text-lg" aria-label={`${rating.fire} out of 5`}>
        {"🔥".repeat(rating.fire)}
        <span className="opacity-20">{"🔥".repeat(5 - rating.fire)}</span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {rating.reasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm text-white/60">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/40" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
