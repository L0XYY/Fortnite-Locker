"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Dice5, Save, Trash2, Share2, Check, ChevronRight, ExternalLink } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio, useHydrated } from "@/store/useStudio";
import { SLOTS, cosmeticTone, alpha, cn } from "@/lib/utils";
import { encodeLoadout } from "@/lib/share";
import { LockerStage } from "@/components/locker/LockerStage";
import { ItemPicker } from "@/components/locker/ItemPicker";
import { RatingCard } from "@/components/locker/RatingCard";
import { CosmeticImage } from "@/components/CosmeticImage";
import { RarityBadge } from "@/components/RarityBadge";
import { CosmeticActions } from "@/components/CosmeticActions";
import { VBucks } from "@/components/VBucks";
import { RealMoney } from "@/components/currency";

export function LockerClient({ starter }: { starter: Record<string, Cosmetic | null> }) {
  const hydrated = useHydrated();
  const locker = useStudio((s) => s.locker);
  const equip = useStudio((s) => s.equip);
  const applyLoadout = useStudio((s) => s.applyLoadout);
  const clearLocker = useStudio((s) => s.clearLocker);
  const presets = useStudio((s) => s.presets);
  const savePreset = useStudio((s) => s.savePreset);
  const deletePreset = useStudio((s) => s.deletePreset);

  const [picker, setPicker] = useState<string | null>(null);
  const [focus, setFocus] = useState("outfit");
  const [presetName, setPresetName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const seeded = useRef(false);
  useEffect(() => {
    if (!hydrated || seeded.current) return;
    seeded.current = true;
    const empty = !locker || Object.values(locker).every((v) => !v);
    if (empty && !localStorage.getItem("fls-seeded")) applyLoadout(starter);
    localStorage.setItem("fls-seeded", "1");
  }, [hydrated, locker, applyLoadout, starter]);

  const display = hydrated ? locker : starter;
  const focused = display[focus] || display.outfit || null;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  async function randomize() {
    setBusy(true);
    try {
      const types = ["outfit", "backpack", "pickaxe", "glider", "wrap"];
      const results = await Promise.all(
        types.map(async (type) => {
          const page = 1 + Math.floor(Math.random() * 60);
          const res = await fetch(`/api/cosmetics?type=${type}&limit=1&page=${page}&sort=newest`);
          const data = (await res.json()) as { items: Cosmetic[] };
          return [type, data.items[0] || null] as const;
        }),
      );
      const next: Record<string, Cosmetic | null> = { ...display };
      for (const [type, item] of results) {
        const slot = SLOTS.find((s) => s.type === type)?.key;
        if (slot) next[slot] = item;
      }
      applyLoadout(next);
      showToast("Randomized loadout 🎲");
    } finally {
      setBusy(false);
    }
  }

  function share() {
    const ids: Record<string, string> = {};
    for (const s of SLOTS) {
      const it = display[s.key];
      if (it) ids[s.key] = it.id;
    }
    if (!Object.keys(ids).length) return showToast("Equip something first");
    const url = `${window.location.origin}/l/${encodeLoadout(ids)}`;
    navigator.clipboard?.writeText(url).then(
      () => showToast("Share link copied 🔗"),
      () => showToast("Copy failed"),
    );
  }

  const equippedCount = SLOTS.filter((s) => display[s.key]).length;

  return (
    <div className="animate-fade-up">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Locker</h1>
          <p className="text-sm text-white/45">{equippedCount} of {SLOTS.length} slots equipped</p>
        </div>
        <button onClick={randomize} disabled={busy} className="btn-ghost">
          <Dice5 className="h-4 w-4" /> {busy ? "Rolling…" : "Randomize"}
        </button>
        <button onClick={share} className="btn-ghost">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <button onClick={() => { clearLocker(); showToast("Locker cleared"); }} className="btn-ghost">
          <Trash2 className="h-4 w-4" /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Slot rail */}
        <div className="space-y-4 xl:order-1 xl:col-span-3">
          <div className="glass rounded-3xl p-3">
            <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-white/40">Equip</p>
            <div className="space-y-1.5">
              {SLOTS.map((s) => {
                const item = display[s.key] || null;
                const tone = item ? cosmeticTone(item) : null;
                const active = focus === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => { setFocus(s.key); setPicker(s.key); }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition",
                      active ? "border-white/25 bg-white/[0.06]" : "border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5"
                      style={tone ? { boxShadow: `inset 0 0 0 1px ${alpha(tone.color, 0.4)}` } : undefined}
                    >
                      {item ? <CosmeticImage cosmetic={item} className="h-full w-full" /> : <span className="text-white/25">＋</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] uppercase tracking-wide text-white/40">{s.group}</span>
                      <span className="block truncate text-sm font-semibold">{item?.name || `Add ${s.label}`}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets */}
          <div className="glass rounded-3xl p-4">
            <p className="pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Saved lockers</p>
            <div className="flex gap-2">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Loadout name"
                className="min-w-0 flex-1 rounded-full bg-black/30 px-3.5 py-2 text-sm outline-none placeholder:text-white/30"
              />
              <button
                onClick={() => { savePreset(presetName); setPresetName(""); showToast("Preset saved"); }}
                className="btn-primary shrink-0 px-3.5"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {hydrated && presets.length === 0 && (
                <p className="px-1 py-2 text-xs text-white/35">No saved lockers yet.</p>
              )}
              {hydrated &&
                presets.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-1.5">
                    <div className="flex -space-x-3">
                      {SLOTS.slice(0, 4).map((s) => {
                        const it = p.loadout[s.key];
                        return (
                          <span key={s.key} className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg border border-white/10 bg-ink-900">
                            {it ? <CosmeticImage cosmetic={it} className="h-full w-full" /> : null}
                          </span>
                        );
                      })}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <button onClick={() => { applyLoadout(p.loadout); showToast("Loaded"); }} className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold hover:bg-white/15">
                      Load
                    </button>
                    <button onClick={() => deletePreset(p.id)} className="grid h-7 w-7 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="xl:order-2 xl:col-span-6">
          <LockerStage loadout={display} onPickSlot={(slot) => { setFocus(slot); setPicker(slot); }} />
        </div>

        {/* Info + rating */}
        <div className="space-y-4 xl:order-3 xl:col-span-3">
          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Cosmetic info</p>
            {focused ? (
              <div className="mt-3">
                <div className="flex gap-3">
                  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/5">
                    <CosmeticImage cosmetic={focused} className="h-full w-full" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold leading-tight">{focused.name}</p>
                    <p className="text-xs text-white/45">{focused.typeLabel}</p>
                    <div className="mt-1.5"><RarityBadge cosmetic={focused} /></div>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Price">
                    {focused.inShopToday && focused.price != null ? (
                      <span className="text-right">
                        <VBucks amount={focused.price} />
                        <RealMoney vbucks={focused.price} className="block text-[10px]" />
                      </span>
                    ) : (
                      <span className="text-white/40">Not in shop</span>
                    )}
                  </Row>
                  <Row label="Series">{focused.series || focused.set || "—"}</Row>
                  <Row label="Introduced">{focused.season || "—"}</Row>
                  <Row label="Shop status">
                    <span className={focused.inShopToday ? "text-emerald-400" : "text-white/40"}>
                      {focused.inShopToday ? "Available today" : "Not available"}
                    </span>
                  </Row>
                </dl>

                <div className="mt-4 flex items-center justify-between">
                  <CosmeticActions cosmetic={focused} compact />
                  <Link href={`/cosmetic/${focused.id}`} className="flex items-center gap-1 text-xs font-semibold text-white/60 hover:text-white">
                    Details <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/40">Select a slot to see cosmetic details.</p>
            )}
          </div>

          <RatingCard loadout={display} />
        </div>
      </div>

      <AnimatePresence>
        {picker && (
          <ItemPicker
            slot={picker}
            onClose={() => setPicker(null)}
            onSelect={(c) => { equip(picker, c); setPicker(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-xl"
          >
            <Check className="mr-1.5 inline h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-white/40">{label}</dt>
      <dd className="truncate font-medium">{children}</dd>
    </div>
  );
}
