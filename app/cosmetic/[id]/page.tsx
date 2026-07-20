import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles, Store, Tag } from "lucide-react";
import { getCosmetic, getBySet } from "@/lib/fortnite";
import { cosmeticTone, alpha, formatDate, cn } from "@/lib/utils";
import { CosmeticCard } from "@/components/CosmeticCard";
import { RarityBadge } from "@/components/RarityBadge";
import { CosmeticActions } from "@/components/CosmeticActions";
import { AddToLockerButton } from "@/components/AddToLockerButton";
import { DetailViewer } from "@/components/cosmetic/DetailViewer";
import { VBucks } from "@/components/VBucks";
import { RealMoney } from "@/components/currency";

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getCosmetic(id);
  if (!c) return { title: "Cosmetic not found" };
  return { title: c.name, description: `${c.name} — ${c.rarityLabel} ${c.typeLabel}. ${c.description}` };
}

export default async function CosmeticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCosmetic(id);
  if (!c) notFound();

  const tone = cosmeticTone(c);
  const related = c.set ? await getBySet(c.set, c.id, 12) : [];
  const popularity = Math.round((tone.order / 7) * 100);

  return (
    <div className="animate-fade-up">
      <Link href="/browse" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 3D showcase */}
        <div
          className="glass-strong relative h-[420px] overflow-hidden rounded-4xl sm:h-[560px]"
          style={{ background: `radial-gradient(70% 60% at 50% 35%, ${alpha(tone.color, 0.2)}, transparent 70%)` }}
        >
          <DetailViewer imageUrl={c.featured || c.image} color={tone.color} showcaseVideo={c.showcaseVideo} />
          <span
            className="pointer-events-none absolute right-4 top-4 z-20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ background: alpha(tone.color, 0.2), color: tone.color, border: `1px solid ${alpha(tone.color, 0.4)}` }}
          >
            {c.typeLabel}
          </span>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <RarityBadge cosmetic={c} />
            {c.set && <span className="chip"><Tag className="h-3 w-3" /> {c.set}</span>}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{c.name}</h1>
          {c.description && <p className="mt-3 max-w-lg leading-relaxed text-white/55">{c.description}</p>}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info icon={Store} label="Shop status">
              <span className={c.inShopToday ? "text-emerald-400" : "text-white/70"}>
                {c.inShopToday ? "Available today" : "Not in shop"}
              </span>
            </Info>
            <Info icon={Tag} label="Current price">
              {c.inShopToday && c.price != null ? (
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <VBucks amount={c.price} />
                  <RealMoney vbucks={c.price} className="text-xs font-normal" />
                </span>
              ) : (
                <span className="text-white/50">—</span>
              )}
            </Info>
            <Info icon={Sparkles} label="Introduced">{c.season || "Unknown"}</Info>
            <Info icon={Calendar} label="Added">{formatDate(c.added)}</Info>
          </div>

          {/* Rarity value meter */}
          <div className="glass mt-3 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Rarity value</span>
              <span className="font-semibold" style={{ color: tone.color }}>{popularity}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full" style={{ width: `${popularity}%`, background: tone.color }} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <AddToLockerButton cosmetic={c} />
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-3">
              <span className="text-sm text-white/50">Collection</span>
              <CosmeticActions cosmetic={c} />
            </div>
          </div>

          <p className="mt-4 select-all font-mono text-[11px] text-white/30">ID: {c.id}</p>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold">More from {c.set}</h2>
            <div className="h-px flex-1 bg-white/8" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {related.map((r) => (
              <CosmeticCard key={r.id} cosmetic={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass rounded-2xl p-4")}>
      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 font-semibold">{children}</div>
    </div>
  );
}
