"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Boxes, Share2, Trash2, Info } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio, useHydrated } from "@/store/useStudio";
import { SLOTS, TYPE_LABELS, cn } from "@/lib/utils";
import { encodeLoadout } from "@/lib/share";
import { CosmeticImage } from "@/components/CosmeticImage";
import { CosmeticCard } from "@/components/CosmeticCard";

export function ProfileClient() {
  const hydrated = useHydrated();
  const router = useRouter();
  const name = useStudio((s) => s.displayName);
  const setName = useStudio((s) => s.setName);
  const owned = useStudio((s) => s.owned);
  const favorites = useStudio((s) => s.favorites);
  const presets = useStudio((s) => s.presets);
  const catalog = useStudio((s) => s.catalog);
  const applyLoadout = useStudio((s) => s.applyLoadout);
  const deletePreset = useStudio((s) => s.deletePreset);

  const ownedItems = owned.map((id) => catalog[id]).filter((c): c is Cosmetic => !!c);
  const favItems = favorites.map((id) => catalog[id]).filter((c): c is Cosmetic => !!c);
  const count = (type: string) => ownedItems.filter((c) => c.type === type).length;

  function sharePreset(loadout: Record<string, Cosmetic | null>) {
    const ids: Record<string, string> = {};
    for (const s of SLOTS) if (loadout[s.key]) ids[s.key] = loadout[s.key]!.id;
    navigator.clipboard?.writeText(`${window.location.origin}/l/${encodeLoadout(ids)}`);
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="glass-strong flex flex-col items-center gap-5 rounded-4xl p-6 sm:flex-row sm:p-8">
        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-indigo-400 via-white to-sky-300 font-display text-4xl font-bold text-ink-950">
          {(hydrated ? name : "P").slice(0, 1).toUpperCase()}
        </span>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <input
              value={hydrated ? name : ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xs rounded-xl bg-transparent font-display text-3xl font-bold outline-none focus:bg-white/5 sm:text-4xl"
              aria-label="Display name"
            />
            <Pencil className="h-4 w-4 shrink-0 text-white/30" />
          </div>
          <p className="mt-1 text-sm text-white/45">Local profile · saved on this device</p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 sm:justify-start">
            <Stat value={owned.length} label="Owned" />
            <Stat value={count("outfit")} label="Skins" />
            <Stat value={count("pickaxe")} label="Pickaxes" />
            <Stat value={count("glider")} label="Gliders" />
            <Stat value={presets.length} label="Lockers" />
          </div>
        </div>
      </div>

      {/* Saved lockers */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold">Saved lockers</h2>
          <div className="h-px flex-1 bg-white/8" />
          <Link href="/locker" className="chip hover:text-white"><Boxes className="h-3.5 w-3.5" /> New</Link>
        </div>
        {hydrated && presets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((p) => (
              <div key={p.id} className="glass flex items-center gap-3 rounded-3xl p-3">
                <div className="flex -space-x-4">
                  {SLOTS.slice(0, 4).map((s) => {
                    const it = p.loadout[s.key];
                    return (
                      <span key={s.key} className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-white/10 bg-ink-900">
                        {it ? <CosmeticImage cosmetic={it} className="h-full w-full" /> : null}
                      </span>
                    );
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-white/40">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => { applyLoadout(p.loadout); router.push("/locker"); }} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">Load</button>
                <button onClick={() => sharePreset(p.loadout)} className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white" aria-label="Share"><Share2 className="h-4 w-4" /></button>
                <button onClick={() => deletePreset(p.id)} className="grid h-8 w-8 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl px-6 py-10 text-center text-sm text-white/45">
            No saved lockers yet. Build one in the <Link href="/locker" className="text-white underline underline-offset-2">Locker</Link>.
          </div>
        )}
      </section>

      {/* Favorites */}
      {favItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold">Favorites</h2>
            <div className="h-px flex-1 bg-white/8" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {favItems.slice(0, 12).map((c) => (
              <CosmeticCard key={c.id} cosmetic={c} />
            ))}
          </div>
        </section>
      )}

      {/* Account (backend-ready) */}
      <section className="glass rounded-4xl p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
          <div>
            <h3 className="font-display text-lg font-bold">Sync across devices</h3>
            <p className="mt-1 max-w-lg text-sm text-white/50">
              Your locker and collection are saved locally in this browser. Account sync with Discord &amp; email login
              is wired for a NextAuth backend — connect one to enable cloud saves and public profiles.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled className="btn-ghost cursor-not-allowed opacity-50">
                <span className="grid h-4 w-4 place-items-center rounded bg-[#5865F2] text-[9px] font-black">D</span>
                Sign in with Discord
              </button>
              <button disabled className="btn-ghost cursor-not-allowed opacity-50">Email login</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-white/45">{label}</p>
    </div>
  );
}
