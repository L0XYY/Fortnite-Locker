"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Check } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import {
  CURRENCIES,
  CURRENCY_BY_CODE,
  formatMoney,
  vbucksToUsd,
  type Rates,
} from "@/lib/currency";
import { cn } from "@/lib/utils";

// --- live rates (module-level singleton so we fetch once) -------------------
let ratesCache: Rates | null = null;
let ratesPromise: Promise<Rates> | null = null;

function useRates(): Rates | null {
  const [rates, setRates] = useState<Rates | null>(ratesCache);
  useEffect(() => {
    if (ratesCache) return;
    if (!ratesPromise) {
      ratesPromise = fetch("/api/rates")
        .then((r) => r.json())
        .then((d: { rates: Rates }) => {
          ratesCache = d.rates || { USD: 1 };
          return ratesCache;
        })
        .catch(() => {
          ratesCache = { USD: 1 };
          return ratesCache;
        });
    }
    ratesPromise.then(setRates);
  }, []);
  return rates;
}

export function useCurrency() {
  const currency = useStudio((s) => s.currency);
  const setCurrency = useStudio((s) => s.setCurrency);
  const rates = useRates();
  return {
    currency,
    setCurrency,
    rates,
    ready: rates != null,
    /** Format a V-Bucks amount as real money in the selected currency. */
    fromVbucks: (vb: number | null | undefined) => formatMoney(vbucksToUsd(vb), currency, rates),
    /** Format a USD amount in the selected currency. */
    fromUsd: (usd: number | null | undefined) => formatMoney(usd ?? null, currency, rates),
  };
}

// --- converted-price label --------------------------------------------------

export function RealMoney({
  vbucks,
  usd,
  className,
  prefix = "≈ ",
  prominent,
}: {
  vbucks?: number | null;
  usd?: number | null;
  className?: string;
  prefix?: string;
  prominent?: boolean;
}) {
  const { fromVbucks, fromUsd } = useCurrency();
  const text = usd != null ? fromUsd(usd) : fromVbucks(vbucks);
  if (!text) return null;
  return (
    <span
      className={cn(
        "tabular-nums",
        prominent ? "font-semibold text-emerald-300" : "text-white/45",
        className,
      )}
    >
      {prefix}
      {text}
    </span>
  );
}

// --- currency picker --------------------------------------------------------

export function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const active = CURRENCY_BY_CODE[currency] ?? CURRENCIES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = CURRENCIES.filter(
    (c) =>
      !q ||
      c.code.toLowerCase().includes(q.toLowerCase()) ||
      c.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-2 text-sm font-semibold transition hover:bg-white/10"
        title="Change currency"
      >
        <span className="text-base leading-none">{active.flag}</span>
        <span className="hidden sm:inline">{active.code}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-white/40 transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 z-[80] mt-2 w-64 overflow-hidden rounded-2xl p-2 shadow-glass"
          >
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-black/30 px-3">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search currency…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-white/35"
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {list.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/8",
                    c.code === currency && "bg-white/10",
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="font-semibold">{c.code}</span>
                  <span className="truncate text-white/45">{c.name}</span>
                  {c.code === currency && <Check className="ml-auto h-4 w-4 text-emerald-400" />}
                </button>
              ))}
              {list.length === 0 && <p className="px-3 py-4 text-center text-sm text-white/40">No match</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
