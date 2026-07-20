import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getShopOffers } from "@/lib/fortnite";
import { ShopOfferCard } from "@/components/ShopOfferCard";
import { ShopConverter } from "@/components/ShopConverter";
import { StatTile } from "@/components/primitives";
import { VBucksCoin } from "@/components/VBucks";

export const metadata: Metadata = {
  title: "Item Shop",
  description: "The live Fortnite Item Shop with real V-Bucks prices, refreshed every rotation.",
};

export const revalidate = 900;

export default async function ShopPage() {
  const { offers, sections } = await getShopOffers();

  const grouped = sections
    .map((section) => ({ section, items: offers.filter((o) => o.section === section) }))
    .filter((g) => g.items.length > 0);

  const totalValue = offers.reduce((sum, o) => sum + o.price, 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="animate-fade-up space-y-8">
      <div className="pt-4">
        <span className="chip mb-3"><ShoppingBag className="h-3.5 w-3.5" /> {today}</span>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Item Shop</h1>
        <p className="mt-2 max-w-xl text-white/50">
          The same sections, items, and prices as the official Fortnite Item Shop — live
          from Epic&apos;s storefront, with real-money pricing in your currency.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="glass rounded-4xl px-6 py-20 text-center">
          <p className="font-display text-xl font-bold">The shop is rotating</p>
          <p className="mt-2 text-sm text-white/45">Epic is refreshing today&apos;s shop — check back in a minute.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile label="Offers today" value={offers.length} accent="#6a5bff" />
            <StatTile label="Sections" value={grouped.length} accent="#33a0ff" />
            <StatTile
              label="Total shop value"
              value={<span className="inline-flex items-center gap-1.5"><VBucksCoin className="h-6 w-6" />{totalValue.toLocaleString()}</span>}
              accent="#5ac8f5"
            />
          </div>

          <ShopConverter shopValueVbucks={totalValue} />

          {grouped.map((g) => (
            <section key={g.section}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-display text-xl font-bold">{g.section}</h2>
                <span className="chip">{g.items.length}</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {g.items.map((o) => (
                  <ShopOfferCard key={o.id} offer={o} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
