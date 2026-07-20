import Link from "next/link";
import type { ShopOffer } from "@/lib/fortnite";
import { cosmeticTone, alpha } from "@/lib/utils";
import { VBucks } from "@/components/VBucks";
import { CosmeticActions } from "@/components/CosmeticActions";
import { RealMoney } from "@/components/currency";

export function ShopOfferCard({ offer }: { offer: ShopOffer }) {
  const primary = offer.items[0];
  const tone = cosmeticTone(primary);
  const discounted = offer.regularPrice > offer.price;

  return (
    <Link
      href={`/cosmetic/${primary.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div
        className="relative aspect-square"
        style={{ background: `radial-gradient(110% 90% at 50% 12%, ${alpha(tone.color, 0.4)}, ${alpha(tone.color, 0.05)} 60%, rgba(0,0,0,0.25))` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.image}
          alt={offer.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />
        {offer.isBundle && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-950">
            Bundle
          </span>
        )}
        {offer.banner && !offer.isBundle && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {offer.banner}
          </span>
        )}
        <div className="absolute right-2.5 top-2.5 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <CosmeticActions cosmetic={primary} compact />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: tone.color }} />
      </div>
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{offer.name}</p>
          <p className="truncate text-[11px] text-white/40">{offer.section}</p>
        </div>
        <div className="shrink-0 text-right">
          <VBucks amount={offer.price} className="text-sm" />
          {discounted && <div className="text-[10px]"><VBucks amount={offer.regularPrice} strike /></div>}
          <RealMoney vbucks={offer.price} prominent={offer.isBundle} className="mt-0.5 block text-[11px]" />
        </div>
      </div>
    </Link>
  );
}
