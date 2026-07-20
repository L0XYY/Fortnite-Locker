import Link from "next/link";
import { ArrowRight, Boxes, Sparkles, TrendingUp, ShoppingBag } from "lucide-react";
import {
  getFeaturedOutfits,
  getTrendingCombos,
  getShopOffers,
  getStats,
} from "@/lib/fortnite";
import { CosmeticCard } from "@/components/CosmeticCard";
import { ComboCard } from "@/components/home/ComboCard";
import { ShopOfferCard } from "@/components/ShopOfferCard";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { SectionHeading } from "@/components/primitives";
import { Reveal } from "@/components/Reveal";

export const revalidate = 900;

export default async function HomePage() {
  const [featured, combos, shop, stats] = await Promise.all([
    getFeaturedOutfits(10),
    getTrendingCombos(3),
    getShopOffers(),
    getStats(),
  ]);

  // Homepage row: unique items, outfits/bundles first for visual punch.
  const seenIds = new Set<string>();
  const shopHighlights = [...shop.offers]
    .sort((a, b) => {
      const av = a.items[0]?.type === "outfit" || a.isBundle ? 0 : 1;
      const bv = b.items[0]?.type === "outfit" || b.isBundle ? 0 : 1;
      return av - bv;
    })
    .filter((o) => {
      const id = o.items[0]?.id;
      if (!id || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .slice(0, 10);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative grid items-center gap-8 pt-6 lg:grid-cols-2 lg:gap-6 lg:pt-10">
        <div className="animate-fade-up">
          <span className="chip mb-5">
            <Sparkles className="h-3.5 w-3.5" /> {stats.total.toLocaleString()} cosmetics · updated daily
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Create your perfect
            <span className="bg-gradient-to-r from-indigo-300 via-white to-sky-300 bg-clip-text text-transparent"> Fortnite locker</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/55">
            Customize outfits, preview combos in a real-time 3D viewer, and track exactly what your collection is worth.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/locker" className="btn-primary px-6 py-3 text-base">
              <Boxes className="h-5 w-5" /> Start creating
            </Link>
            <Link href="/browse" className="btn-ghost px-6 py-3 text-base">
              Browse cosmetics <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 flex gap-8">
            <Stat label="Cosmetics" value={stats.total.toLocaleString()} />
            <Stat label="Outfits" value={stats.outfits.toLocaleString()} />
            <Stat label="In shop today" value={stats.inShop.toLocaleString()} />
          </div>
        </div>
        <HeroShowcase outfits={featured} />
      </section>

      {/* Featured skins */}
      <Reveal>
        <section>
          <SectionHeading
            title="Featured skins"
            subtitle="Hand-picked icons with premium renders"
            action={<HeaderLink href="/browse" icon={Sparkles} />}
          />
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {featured.map((c) => (
              <div key={c.id} className="w-40 shrink-0 snap-start sm:w-44">
                <CosmeticCard cosmetic={c} />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Trending combos */}
      {combos.length > 0 && (
        <Reveal>
          <section>
            <SectionHeading
              title="Trending combos"
              subtitle="Cohesive set-based loadouts, ready to remix"
              action={<HeaderLink href="/locker" icon={TrendingUp} label="Build yours" />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((c, i) => (
                <ComboCard key={i} loadout={c} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Item shop */}
      {shop.offers.length > 0 && (
        <Reveal>
          <section>
            <SectionHeading
              title="In the Item Shop today"
              subtitle="Live prices, refreshed every rotation"
              action={<HeaderLink href="/shop" icon={ShoppingBag} label="Full shop" />}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {shopHighlights.map((o) => (
                <ShopOfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-white/45">{label}</p>
    </div>
  );
}

function HeaderLink({ href, icon: Icon, label = "See all" }: { href: string; icon: React.ComponentType<{ className?: string }>; label?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
