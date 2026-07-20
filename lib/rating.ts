// ---------------------------------------------------------------------------
// "Combo Score" — a transparent heuristic that rates a locker combination.
// Not an ML model: it scores set cohesion, rarity, completeness and color
// harmony so the number is explainable and stable.  Client-safe.
// ---------------------------------------------------------------------------

import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone } from "@/lib/utils";

export interface Rating {
  score: number; // 0 - 10, one decimal
  fire: number; // 0 - 5 flames
  style: string;
  reasons: string[];
}

type Loadout = Record<string, Cosmetic | null | undefined>;

const CORE = ["outfit", "backpack", "pickaxe", "glider"];

export function rateLoadout(loadout: Loadout): Rating {
  const equipped = Object.values(loadout).filter((c): c is Cosmetic => !!c);
  if (equipped.length === 0) {
    return { score: 0, fire: 0, style: "Empty", reasons: ["Equip an outfit to begin scoring."] };
  }

  const reasons: string[] = [];

  // 1. Completeness — how many core slots are filled (0..1)
  const coreFilled = CORE.filter((k) => loadout[k]).length;
  const completeness = coreFilled / CORE.length;

  // 2. Set cohesion — largest group of items sharing a matching set.
  const setCounts = new Map<string, number>();
  for (const c of equipped) if (c.set) setCounts.set(c.set, (setCounts.get(c.set) || 0) + 1);
  const bestSet = Math.max(0, ...setCounts.values());
  const setMatchName = [...setCounts.entries()].find(([, n]) => n === bestSet)?.[0];
  const cohesion = Math.min(1, (bestSet - 1) / 3); // 2 items = .33, 4+ = 1

  // 3. Rarity value — average rarity/series rank (0..1)
  const avgRank =
    equipped.reduce((s, c) => s + cosmeticTone(c).order, 0) / equipped.length;
  const rarityScore = Math.min(1, avgRank / 6);

  // 4. Color harmony — how tightly the accent colors cluster.
  const harmony = colorHarmony(equipped.map((c) => cosmeticTone(c).color));

  const raw =
    completeness * 0.28 + cohesion * 0.3 + rarityScore * 0.24 + harmony * 0.18;
  const score = Math.round(Math.min(10, 2 + raw * 8.2) * 10) / 10;

  // --- Explanations --------------------------------------------------------
  if (bestSet >= 2 && setMatchName)
    reasons.push(`${bestSet} pieces from the ${setMatchName} set lock in together.`);
  if (harmony > 0.72) reasons.push("The accent colors sit in the same palette — very cohesive.");
  else if (harmony < 0.4) reasons.push("The colors clash a little; try matching tones.");
  if (rarityScore > 0.75) reasons.push("Loaded with high-rarity, high-value cosmetics.");
  if (completeness < 1) reasons.push(`Fill ${4 - coreFilled} more core slot${4 - coreFilled > 1 ? "s" : ""} for a higher score.`);
  if (equipped.some((c) => c.series)) reasons.push("Series items add prestige to the combo.");
  if (reasons.length === 0) reasons.push("Solid, balanced loadout with room to specialize.");

  return {
    score,
    fire: Math.max(1, Math.min(5, Math.round(score / 2))),
    style: styleLabel(equipped, harmony, rarityScore),
    reasons: reasons.slice(0, 3),
  };
}

function styleLabel(equipped: Cosmetic[], harmony: number, rarity: number): string {
  const series = equipped.find((c) => c.series)?.series?.toLowerCase() || "";
  if (/marvel|dc/.test(series)) return "Heroic";
  if (/icon/.test(series)) return "Iconic";
  if (/gaming|star wars/.test(series)) return "Legendary";
  if (rarity > 0.8 && harmony > 0.7) return "Aggressive";
  if (harmony > 0.75) return "Clean";
  if (rarity > 0.7) return "Flashy";
  return "Balanced";
}

/** Returns 0..1 — 1 when accent colors are near-identical in hue. */
function colorHarmony(hexes: string[]): number {
  if (hexes.length < 2) return 0.7;
  const hues = hexes.map(hue);
  let spread = 0;
  let pairs = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let d = Math.abs(hues[i] - hues[j]);
      if (d > 180) d = 360 - d;
      spread += d;
      pairs++;
    }
  }
  const avg = spread / pairs; // 0..180
  return Math.max(0, 1 - avg / 120);
}

function hue(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let hh: number;
  if (max === r) hh = ((g - b) / d) % 6;
  else if (max === g) hh = (b - r) / d + 2;
  else hh = (r - g) / d + 4;
  hh *= 60;
  return hh < 0 ? hh + 360 : hh;
}
