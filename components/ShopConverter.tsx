"use client";

import { useState } from "react";
import { ArrowRight, Wallet } from "lucide-react";
import { useCurrency, CurrencySelect } from "@/components/currency";
import { VBucksCoin } from "@/components/VBucks";
import { VBUCK_REFERENCE, CURRENCY_BY_CODE } from "@/lib/currency";

const PRESETS = [1000, 2000, 2800, 5000, 13500];

export function ShopConverter({ shopValueVbucks }: { shopValueVbucks: number }) {
  const { currency, fromVbucks } = useCurrency();
  const [amount, setAmount] = useState(2800);
  const name = CURRENCY_BY_CODE[currency]?.name ?? currency;

  return (
    <div className="glass rounded-4xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Wallet className="h-5 w-5 text-emerald-300" /> Currency converter
          </h3>
          <p className="mt-1 text-sm text-white/50">See any V-Bucks price in real money, in your currency.</p>
        </div>
        <CurrencySelect />
      </div>

      <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/40">V-Bucks</span>
          <div className="mt-1 flex items-center gap-2">
            <VBucksCoin className="h-5 w-5" />
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent font-display text-2xl font-bold tabular-nums outline-none"
            />
          </div>
        </label>

        <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white/8 sm:mx-0">
          <ArrowRight className="h-4 w-4 text-white/60" />
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/40">In {name}</span>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-emerald-300">
            {fromVbucks(amount) ?? "…"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              amount === p ? "border-white bg-white text-ink-950" : "border-white/12 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {p.toLocaleString()}
          </button>
        ))}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/8 pt-3 text-xs text-white/40">
        <span>
          Today&apos;s shop ≈{" "}
          <span className="font-semibold text-white/70">{fromVbucks(shopValueVbucks) ?? "…"}</span>
        </span>
        <span className="text-white/25">·</span>
        <span>Estimated from {VBUCK_REFERENCE} · live FX rates</span>
      </p>
    </div>
  );
}
