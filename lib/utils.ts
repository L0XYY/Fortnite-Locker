// ---------------------------------------------------------------------------
// Shared helpers: className merging, formatting, rarity/series theming.
// ---------------------------------------------------------------------------

/** Tiny classNames combiner (no dependency needed). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** 1200 -> "1,200" */
export function formatVBucks(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}

/** Human "45 days ago" style relative time from an ISO date. */
export function relativeTime(iso?: string | null): string {
  if (!iso) return "Unknown";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const diff = Date.now() - then;
  const day = 86_400_000;
  const days = Math.floor(diff / day);
  if (days < 0) return "Upcoming";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// --- Rarity ----------------------------------------------------------------

export interface Tone {
  label: string;
  /** Primary accent color. */
  color: string;
  /** Order for sorting (higher = rarer). */
  order: number;
}

const RARITY: Record<string, Tone> = {
  common: { label: "Common", color: "#9aa4b2", order: 1 },
  uncommon: { label: "Uncommon", color: "#5bbb3a", order: 2 },
  rare: { label: "Rare", color: "#33a0ff", order: 3 },
  epic: { label: "Epic", color: "#b45bff", order: 4 },
  legendary: { label: "Legendary", color: "#ff8a3d", order: 5 },
  mythic: { label: "Mythic", color: "#f6cf5b", order: 6 },
};

// Series get their own signature colors (overrides the base rarity color).
const SERIES: Array<{ match: RegExp; color: string; order: number }> = [
  { match: /marvel/i, color: "#e23b42", order: 7 },
  { match: /\bdc\b/i, color: "#4f7ed6", order: 7 },
  { match: /icon/i, color: "#13c2c2", order: 7 },
  { match: /gaming legends/i, color: "#6a5bff", order: 7 },
  { match: /star wars|columbus/i, color: "#2f7fc6", order: 7 },
  { match: /lava/i, color: "#ff5b2e", order: 7 },
  { match: /frozen|moniker/i, color: "#7fd4ff", order: 7 },
  { match: /shadow/i, color: "#7a7a86", order: 7 },
  { match: /slurp/i, color: "#22c1a6", order: 7 },
  { match: /dark/i, color: "#d23bd2", order: 7 },
  { match: /creator|collab/i, color: "#ff5ba0", order: 7 },
];

export function rarityTone(rarityValue?: string | null): Tone {
  return RARITY[(rarityValue || "").toLowerCase()] ?? RARITY.rare;
}

/** Dominant color for a cosmetic — series signature color wins over rarity. */
export function cosmeticTone(c: { rarity?: string | null; series?: string | null }): Tone {
  const base = rarityTone(c.rarity);
  if (c.series) {
    const hit = SERIES.find((s) => s.match.test(c.series!));
    if (hit) return { label: c.series, color: hit.color, order: hit.order };
  }
  return base;
}

/** Convert a hex color to an `rgba()` string. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// --- Cosmetic types / locker slots -----------------------------------------

export interface SlotDef {
  /** Locker slot key. */
  key: string;
  /** API cosmetic type value that fills this slot. */
  type: string;
  label: string;
  /** Short section label used in the locker rail. */
  group: string;
}

/** The equip-able locker slots, in display order. */
export const SLOTS: SlotDef[] = [
  { key: "outfit", type: "outfit", label: "Outfit", group: "Character" },
  { key: "backpack", type: "backpack", label: "Back Bling", group: "Back" },
  { key: "pickaxe", type: "pickaxe", label: "Pickaxe", group: "Harvesting" },
  { key: "glider", type: "glider", label: "Glider", group: "Glider" },
  { key: "contrail", type: "contrail", label: "Contrail", group: "Trail" },
  { key: "wrap", type: "wrap", label: "Wrap", group: "Wrap" },
  { key: "emote", type: "emote", label: "Emote", group: "Emote Wheel" },
];

export const SLOT_BY_KEY: Record<string, SlotDef> = Object.fromEntries(
  SLOTS.map((s) => [s.key, s]),
);

/** Human labels for API cosmetic types (used in filters / badges). */
export const TYPE_LABELS: Record<string, string> = {
  outfit: "Outfit",
  backpack: "Back Bling",
  pickaxe: "Pickaxe",
  glider: "Glider",
  contrail: "Contrail",
  wrap: "Wrap",
  emote: "Emote",
  loadingscreen: "Loading Screen",
  music: "Music",
  spray: "Spray",
  banner: "Banner",
  emoji: "Emoji",
  toy: "Toy",
  pet: "Pet",
};

export const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
