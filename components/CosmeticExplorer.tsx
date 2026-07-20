"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { CosmeticCard } from "@/components/CosmeticCard";
import { Pill } from "@/components/primitives";
import {
  TYPE_OPTIONS,
  RARITY_OPTIONS,
  SERIES_OPTIONS,
  SEASON_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

interface Filters {
  q: string;
  type: string;
  rarity: string;
  series: string;
  season: string;
  sort: string;
  inShop: boolean;
}

const DEFAULTS: Filters = {
  q: "",
  type: "outfit",
  rarity: "",
  series: "",
  season: "",
  sort: "newest",
  inShop: false,
};

async function fetchPage(page: number, f: Filters, signal?: AbortSignal) {
  const p = new URLSearchParams({ page: String(page), limit: "48", sort: f.sort });
  if (f.q) p.set("q", f.q);
  if (f.type) p.set("type", f.type);
  if (f.rarity) p.set("rarity", f.rarity);
  if (f.series) p.set("series", f.series);
  if (f.season) p.set("season", f.season);
  if (f.inShop) p.set("inShop", "1");
  const res = await fetch(`/api/cosmetics?${p.toString()}`, { signal });
  if (!res.ok) throw new Error("fetch failed");
  return (await res.json()) as { items: Cosmetic[]; total: number };
}

export function CosmeticExplorer({ initial }: { initial?: Partial<Filters> }) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULTS, ...initial });
  const [input, setInput] = useState(filters.q);
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce the search box into the filter set.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === input ? f : { ...f, q: input })), 280);
    return () => clearTimeout(t);
  }, [input]);

  const filterKey = JSON.stringify(filters);
  const hasMore = items.length < total;

  // Reset + load first page whenever the filters change.
  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    setLoading(true);
    setPage(1);
    fetchPage(1, filters, ctrl.signal)
      .then((r) => {
        if (!active) return;
        setItems(r.items);
        setTotal(r.total);
        setLoading(false);
      })
      .catch((e) => {
        if (e?.name !== "AbortError" && active) setLoading(false);
      });
    return () => {
      active = false;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || items.length >= total) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await fetchPage(next, filters);
      setItems((prev) => [...prev, ...r.items]);
      setTotal(r.total);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, items.length, total, page, filters]);

  // Infinite scroll sentinel.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      { rootMargin: "800px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const activeFilterCount =
    (filters.rarity ? 1 : 0) + (filters.series ? 1 : 0) + (filters.season ? 1 : 0) + (filters.inShop ? 1 : 0);

  return (
    <div>
      {/* Search + controls */}
      <div className="glass sticky top-[76px] z-30 rounded-3xl p-3 shadow-glass">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-black/30 px-4">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search 15,000+ cosmetics…"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/35"
            />
            {input && (
              <button onClick={() => setInput("")} aria-label="Clear">
                <X className="h-4 w-4 text-white/40 hover:text-white" />
              </button>
            )}
          </div>
          <select
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value })}
            className="hidden rounded-full border border-white/12 bg-black/30 px-3 py-2.5 text-sm outline-none sm:block"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-900">
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition sm:w-auto sm:px-4",
              showFilters || activeFilterCount
                ? "border-white bg-white text-ink-950"
                : "border-white/12 bg-black/30 text-white/70 hover:text-white",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="ml-2 hidden text-sm font-semibold sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-[10px] font-bold text-white sm:static sm:ml-1.5 sm:h-4 sm:w-4">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Type quick-pills */}
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-0.5">
          {TYPE_OPTIONS.map((o) => (
            <Pill key={o.value} active={filters.type === o.value} onClick={() => set({ type: o.value })}>
              {o.label}
            </Pill>
          ))}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/8 pt-3 sm:grid-cols-4">
            <FilterSelect label="Rarity" value={filters.rarity} onChange={(v) => set({ rarity: v })} options={RARITY_OPTIONS} />
            <FilterSelect label="Series" value={filters.series} onChange={(v) => set({ series: v })} options={SERIES_OPTIONS} />
            <FilterSelect label="Chapter" value={filters.season} onChange={(v) => set({ season: v })} options={SEASON_OPTIONS} />
            <FilterSelect label="Sort" value={filters.sort} onChange={(v) => set({ sort: v })} options={SORT_OPTIONS} className="sm:hidden" />
            <button
              onClick={() => set({ inShop: !filters.inShop })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                filters.inShop
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                  : "border-white/12 bg-black/30 text-white/60 hover:text-white",
              )}
            >
              In shop today
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-4 flex items-center justify-between px-1 text-sm text-white/45">
        <span>
          {loading ? "Loading…" : `${total.toLocaleString()} result${total === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 15 }).map((_, i) => <CardSkeleton key={i} />)
          : items.map((c) => <CosmeticCard key={c.id} cosmetic={c} />)}
        {!loading && loadingMore && Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={`m${i}`} />)}
      </div>

      {!loading && items.length === 0 && (
        <div className="glass mt-6 rounded-3xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">No cosmetics found</p>
          <p className="mt-1 text-sm text-white/45">Try a different search or clear your filters.</p>
        </div>
      )}

      <div ref={sentinel} className="h-10" />
      {!loading && !hasMore && items.length > 0 && (
        <p className="mt-6 text-center text-xs text-white/30">You&apos;ve reached the end.</p>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="px-1 text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03]">
      <div className="shimmer aspect-square bg-white/[0.03]" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-2/3 rounded-full bg-white/8" />
        <div className="h-2.5 w-1/3 rounded-full bg-white/5" />
      </div>
    </div>
  );
}
