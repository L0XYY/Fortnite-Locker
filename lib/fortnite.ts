// ---------------------------------------------------------------------------
// Fortnite data layer.  SERVER-ONLY (uses the Next.js fetch cache).
// Import *types* into client components with `import type`.
//
// Data source: https://fortnite-api.com  — a free, key-less community API that
// mirrors Epic's Battle Royale cosmetics + the live Item Shop.
// ---------------------------------------------------------------------------

import { TYPE_LABELS, rarityTone, cosmeticTone } from "@/lib/utils";

const BASE = "https://fortnite-api.com/v2";

/** Slim, normalized cosmetic used everywhere in the UI. */
export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  type: string;
  typeLabel: string;
  rarity: string;
  rarityLabel: string;
  series: string | null;
  set: string | null;
  season: string | null;
  chapter: string | null;
  added: string | null;
  image: string;
  featured: string | null;
  /** YouTube id of Epic's official 3D showcase video, when available. */
  showcaseVideo: string | null;
  /** Merged from the live shop when relevant. */
  price: number | null;
  inShopToday: boolean;
}

export interface ShopOffer {
  id: string;
  name: string;
  price: number;
  regularPrice: number;
  section: string;
  /** Epic's canonical section order (layout.index) — used to match fortnite.com. */
  sectionIndex: number;
  /** Epic's in-section ordering weight (sortPriority). */
  sort: number;
  image: string;
  items: Cosmetic[];
  isBundle: boolean;
  banner: string | null;
}

// --- Raw API shapes (only what we read) ------------------------------------

interface RawCosmetic {
  id: string;
  name: string;
  description?: string;
  type?: { value?: string; displayValue?: string };
  rarity?: { value?: string; displayValue?: string };
  series?: { value?: string } | null;
  set?: { value?: string } | null;
  introduction?: { chapter?: string; season?: string; text?: string } | null;
  images?: { smallIcon?: string; icon?: string; featured?: string | null };
  showcaseVideo?: string | null;
  added?: string;
}

function normalize(r: RawCosmetic): Cosmetic {
  const type = (r.type?.value || "unknown").toLowerCase();
  const rarity = (r.rarity?.value || "rare").toLowerCase();
  const img = r.images || {};
  const chapter = r.introduction?.chapter || null;
  const season = r.introduction?.season || null;
  return {
    id: r.id,
    name: r.name || "Unknown",
    description: r.description || "",
    type,
    typeLabel: TYPE_LABELS[type] || r.type?.displayValue || type,
    rarity,
    rarityLabel: r.rarity?.displayValue || rarityTone(rarity).label,
    series: r.series?.value || null,
    set: r.set?.value || null,
    season: chapter ? `Chapter ${chapter}${season ? `, Season ${season}` : ""}` : null,
    chapter,
    added: r.added || null,
    image: img.icon || img.smallIcon || img.featured || "",
    featured: img.featured || null,
    showcaseVideo: r.showcaseVideo || null,
    price: null,
    inShopToday: false,
  };
}

async function apiFetch<T>(path: string, revalidate: number): Promise<T> {
  // revalidate <= 0 → skip the Next data cache (used for the ~20MB cosmetics
  // payload, which exceeds the 2MB cache limit; our in-process memo caches it).
  const init: RequestInit & { next?: { revalidate: number } } =
    revalidate > 0
      ? { next: { revalidate }, headers: { "Accept-Language": "en" } }
      : { cache: "no-store", headers: { "Accept-Language": "en" } };
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`Fortnite API ${path} → ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

// --- In-process memo (dev + prod single instance) --------------------------

interface Index {
  at: number;
  all: Cosmetic[];
  byId: Map<string, Cosmetic>;
  byType: Map<string, Cosmetic[]>;
}
let _index: Index | null = null;
let _indexPromise: Promise<Index> | null = null;
const INDEX_TTL = 1000 * 60 * 30;

async function buildIndex(): Promise<Index> {
  const raw = await apiFetch<RawCosmetic[]>("/cosmetics/br?language=en", 0);
  const all: Cosmetic[] = [];
  const byId = new Map<string, Cosmetic>();
  const byType = new Map<string, Cosmetic[]>();
  for (const r of raw) {
    if (!r?.id || !r.images?.icon) continue; // skip items without a usable render
    const c = normalize(r);
    all.push(c);
    byId.set(c.id, c);
    const list = byType.get(c.type);
    if (list) list.push(c);
    else byType.set(c.type, [c]);
  }
  return { at: Date.now(), all, byId, byType };
}

async function getIndex(): Promise<Index> {
  if (_index && Date.now() - _index.at < INDEX_TTL) return _index;
  if (!_indexPromise) {
    _indexPromise = buildIndex()
      .then((idx) => {
        _index = idx;
        return idx;
      })
      .finally(() => {
        _indexPromise = null;
      });
  }
  return _indexPromise;
}

// --- Live shop -------------------------------------------------------------

interface RawShopEntry {
  regularPrice?: number;
  finalPrice?: number;
  offerId?: string;
  inDate?: string;
  sortPriority?: number;
  banner?: { value?: string } | null;
  bundle?: { name?: string; image?: string } | null;
  layout?: { name?: string; category?: string; index?: number; rank?: number } | null;
  brItems?: RawCosmetic[];
}

interface ShopCache {
  at: number;
  priceById: Map<string, number>;
  offers: ShopOffer[];
}
let _shop: ShopCache | null = null;
let _shopPromise: Promise<ShopCache> | null = null;
const SHOP_TTL = 1000 * 60 * 15;

async function buildShop(): Promise<ShopCache> {
  const data = await apiFetch<{ entries?: RawShopEntry[] }>("/shop?language=en", 900);
  const entries = data.entries || [];
  const priceById = new Map<string, number>();
  const offers: ShopOffer[] = [];

  for (const e of entries) {
    const items = (e.brItems || [])
      .filter((r) => r?.id && r.images?.icon)
      .map(normalize);
    if (!items.length) continue;
    const price = e.finalPrice ?? e.regularPrice ?? 0;
    for (const it of items) {
      const prev = priceById.get(it.id);
      if (prev == null || price < prev) priceById.set(it.id, price);
    }
    const isBundle = !!e.bundle || items.length > 1;
    const hero = items.find((i) => i.featured) || items[0];
    offers.push({
      id: e.offerId || hero.id,
      name: e.bundle?.name || hero.name,
      price,
      regularPrice: e.regularPrice ?? price,
      section: e.layout?.name || "Featured",
      sectionIndex: e.layout?.index ?? 900,
      sort: e.sortPriority ?? 0,
      image: e.bundle?.image || hero.featured || hero.image,
      items,
      isBundle,
      banner: e.banner?.value || null,
    });
  }
  // De-dup only exact repeat offers (same offerId). Epic legitimately lists the
  // same item in multiple sections, and fortnite.com shows it in each — keep those.
  const seen = new Set<string>();
  const deduped = offers.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
  return { at: Date.now(), priceById, offers: deduped };
}

async function getShopCache(): Promise<ShopCache> {
  if (_shop && Date.now() - _shop.at < SHOP_TTL) return _shop;
  if (!_shopPromise) {
    _shopPromise = buildShop()
      .then((s) => {
        _shop = s;
        return s;
      })
      .catch((err) => {
        // Shop can briefly 500 during Epic's daily rotation — degrade gracefully.
        console.error("[shop]", err);
        const empty: ShopCache = { at: Date.now(), priceById: new Map(), offers: [] };
        _shop = empty;
        return empty;
      })
      .finally(() => {
        _shopPromise = null;
      });
  }
  return _shopPromise;
}

function withShop(c: Cosmetic, priceById: Map<string, number>): Cosmetic {
  const price = priceById.get(c.id);
  if (price == null) return c;
  return { ...c, price, inShopToday: true };
}

// --- Public query API ------------------------------------------------------

export interface Query {
  type?: string;
  q?: string;
  rarity?: string;
  series?: string;
  season?: string;
  inShop?: boolean;
  sort?: "newest" | "name" | "rarity" | "price";
  page?: number;
  limit?: number;
}

export interface QueryResult {
  items: Cosmetic[];
  total: number;
  page: number;
  limit: number;
}

export async function queryCosmetics(query: Query): Promise<QueryResult> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  const { type, q, rarity, series, season, inShop, sort = "newest" } = query;
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(120, Math.max(1, query.limit || 48));

  let pool = type ? idx.byType.get(type) || [] : idx.all;
  const needle = q?.trim().toLowerCase();

  let items = pool.filter((c) => {
    if (rarity && c.rarity !== rarity) return false;
    if (series && (c.series || "").toLowerCase() !== series.toLowerCase()) return false;
    if (season && c.chapter !== season) return false;
    if (inShop && !shop.priceById.has(c.id)) return false;
    if (needle) {
      const hay = `${c.name} ${c.set || ""} ${c.series || ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  items.sort((a, b) => {
    if (needle) {
      // Prioritize name matches that start with the query.
      const as = a.name.toLowerCase().startsWith(needle) ? 0 : 1;
      const bs = b.name.toLowerCase().startsWith(needle) ? 0 : 1;
      if (as !== bs) return as - bs;
    }
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rarity":
        return cosmeticTone(b).order - cosmeticTone(a).order || a.name.localeCompare(b.name);
      case "price":
        return (shop.priceById.get(b.id) ?? -1) - (shop.priceById.get(a.id) ?? -1);
      case "newest":
      default:
        return (b.added || "").localeCompare(a.added || "");
    }
  });

  const total = items.length;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit).map((c) => withShop(c, shop.priceById));
  return { items: slice, total, page, limit };
}

export async function getCosmetic(id: string): Promise<Cosmetic | null> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  const c = idx.byId.get(id);
  return c ? withShop(c, shop.priceById) : null;
}

/** Other cosmetics from the same set (for the detail page). */
export async function getBySet(setName: string, excludeId: string, limit: number): Promise<Cosmetic[]> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  return idx.all
    .filter((c) => c.set === setName && c.id !== excludeId)
    .slice(0, limit)
    .map((c) => withShop(c, shop.priceById));
}

export async function getManyCosmetics(ids: string[]): Promise<Cosmetic[]> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  return ids
    .map((id) => idx.byId.get(id))
    .filter((c): c is Cosmetic => !!c)
    .map((c) => withShop(c, shop.priceById));
}

export async function getShopOffers(): Promise<{ offers: ShopOffer[]; sections: string[] }> {
  const shop = await getShopCache();
  // Order exactly like the official Item Shop: by Epic's section index, then by
  // in-section sort priority (higher first), then bigger offers first.
  const offers = [...shop.offers].sort(
    (a, b) =>
      a.sectionIndex - b.sectionIndex ||
      b.sort - a.sort ||
      b.regularPrice - a.regularPrice ||
      a.name.localeCompare(b.name),
  );
  const sections: string[] = [];
  for (const o of offers) if (!sections.includes(o.section)) sections.push(o.section);
  return { offers, sections };
}

/** Deterministic "featured" outfits with great hero renders for the homepage. */
export async function getFeaturedOutfits(count: number): Promise<Cosmetic[]> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  const outfits = (idx.byType.get("outfit") || []).filter(
    (c) => c.featured && (c.series || c.rarity === "legendary" || c.rarity === "mythic"),
  );
  // Deterministic shuffle by id hash so SSR and client agree.
  const scored = outfits
    .map((c) => ({ c, k: hash(c.id) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, count)
    .map((x) => withShop(x.c, shop.priceById));
  return scored;
}

/** A cohesive default loadout so the Locker looks alive on first visit. */
export async function getStarterLoadout(): Promise<Record<string, Cosmetic | null>> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  const byType = idx.byType;
  const outfits = (byType.get("outfit") || []).filter(
    (c) => c.set && c.featured && (c.series || c.rarity === "legendary"),
  );
  const outfit = outfits.length
    ? outfits.reduce((a, b) => (hash(a.id) < hash(b.id) ? a : b))
    : (byType.get("outfit") || [])[0] || null;
  const set = outfit?.set;

  const fromSet = (type: string): Cosmetic | null => {
    const list = byType.get(type) || [];
    const match = set && list.find((c) => c.set === set);
    if (match) return match;
    const withImg = list.filter((c) => c.image);
    if (!withImg.length) return null;
    return withImg.reduce((a, b) => (hash(a.id + type) < hash(b.id + type) ? a : b));
  };

  const loadout: Record<string, Cosmetic | null> = {
    outfit: outfit || null,
    backpack: fromSet("backpack"),
    pickaxe: fromSet("pickaxe"),
    glider: fromSet("glider"),
    wrap: fromSet("wrap"),
    contrail: null,
    emote: null,
  };
  for (const k of Object.keys(loadout)) {
    if (loadout[k]) loadout[k] = withShop(loadout[k]!, shop.priceById);
  }
  return loadout;
}

/** A few cohesive, set-based loadouts for the homepage "Trending combos". */
export async function getTrendingCombos(n: number): Promise<Record<string, Cosmetic | null>[]> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  const byType = idx.byType;
  const outfits = (byType.get("outfit") || [])
    .filter((c) => c.set && c.featured)
    .sort((a, b) => hash(a.id) - hash(b.id));

  const inType = (type: string, set: string) => (byType.get(type) || []).find((c) => c.set === set) || null;
  const combos: Record<string, Cosmetic | null>[] = [];
  const usedSets = new Set<string>();

  for (const outfit of outfits) {
    const set = outfit.set!;
    if (usedSets.has(set)) continue;
    const backpack = inType("backpack", set);
    const pickaxe = inType("pickaxe", set);
    const glider = inType("glider", set);
    const pieces = [backpack, pickaxe, glider].filter(Boolean).length;
    if (pieces < 2) continue;
    usedSets.add(set);
    const loadout: Record<string, Cosmetic | null> = { outfit, backpack, pickaxe, glider, wrap: null, contrail: null, emote: null };
    for (const k of Object.keys(loadout)) if (loadout[k]) loadout[k] = withShop(loadout[k]!, shop.priceById);
    combos.push(loadout);
    if (combos.length >= n) break;
  }
  return combos;
}

export async function getStats(): Promise<{ total: number; outfits: number; inShop: number }> {
  const [idx, shop] = await Promise.all([getIndex(), getShopCache()]);
  return {
    total: idx.all.length,
    outfits: (idx.byType.get("outfit") || []).length,
    inShop: shop.priceById.size,
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
