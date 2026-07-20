"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Ban } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { SLOT_BY_KEY, cosmeticTone, alpha } from "@/lib/utils";
import { CosmeticImage } from "@/components/CosmeticImage";

export function ItemPicker({
  slot,
  onSelect,
  onClose,
}: {
  slot: string;
  onSelect: (c: Cosmetic | null) => void;
  onClose: () => void;
}) {
  const def = SLOT_BY_KEY[slot];
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 260);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const load = useCallback(
    async (pageNum: number, replace: boolean, signal?: AbortSignal) => {
      const p = new URLSearchParams({
        type: def.type,
        page: String(pageNum),
        limit: "36",
        sort: debounced ? "rarity" : "newest",
      });
      if (debounced) p.set("q", debounced);
      const res = await fetch(`/api/cosmetics?${p}`, { signal });
      const data = (await res.json()) as { items: Cosmetic[]; total: number };
      setTotal(data.total);
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
    },
    [def.type, debounced],
  );

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    setLoading(true);
    setPage(1);
    load(1, true, ctrl.signal)
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [load]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(async (e) => {
      if (e[0]?.isIntersecting && !loadingMore && items.length < total) {
        setLoadingMore(true);
        const next = page + 1;
        await load(next, false).catch(() => {});
        setPage(next);
        setLoadingMore(false);
      }
    }, { rootMargin: "400px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [items.length, total, page, loadingMore, load]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-4xl sm:h-[80vh] sm:rounded-4xl"
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-white/8 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/40">Choose</p>
              <h3 className="font-display text-xl font-bold">{def.label}</h3>
            </div>
            <div className="ml-auto flex flex-1 items-center gap-2 rounded-full bg-black/30 px-4 sm:max-w-xs">
              <Search className="h-4 w-4 text-white/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${def.label.toLowerCase()}s…`}
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/35"
              />
            </div>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
            <button
              onClick={() => onSelect(null)}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-white/50 transition hover:border-white/30 hover:text-white"
            >
              <Ban className="h-6 w-6" />
              <span className="text-xs font-medium">None</span>
            </button>

            {loading
              ? Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="shimmer aspect-square rounded-2xl bg-white/[0.03]" />
                ))
              : items.map((c) => {
                  const tone = cosmeticTone(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c)}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-white/25"
                      style={{ outlineColor: tone.color }}
                    >
                      <CosmeticImage cosmetic={c} className="aspect-square w-full" />
                      <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: tone.color }} />
                      <span
                        className="truncate px-2 py-1.5 text-center text-[11px] font-medium"
                        style={{ background: alpha(tone.color, 0.08) }}
                      >
                        {c.name}
                      </span>
                    </button>
                  );
                })}
            <div ref={sentinel} className="col-span-full h-4" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
