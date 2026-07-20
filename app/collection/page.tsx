import type { Metadata } from "next";
import { getStats } from "@/lib/fortnite";
import { CollectionClient } from "@/components/collection/CollectionClient";

export const metadata: Metadata = {
  title: "Collection",
  description: "Track your owned Fortnite cosmetics, wishlist, favorites, and total collection value.",
};

export const revalidate = 3600;

export default async function CollectionPage() {
  const stats = await getStats();
  return (
    <div>
      <div className="mb-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Collection</h1>
        <p className="mt-2 max-w-xl text-white/50">
          Everything you own, want, and love — with a running estimate of what it&apos;s worth.
        </p>
      </div>
      <CollectionClient total={stats.total} />
    </div>
  );
}
