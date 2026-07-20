import type { Metadata } from "next";
import { CosmeticExplorer } from "@/components/CosmeticExplorer";

export const metadata: Metadata = {
  title: "Browse Cosmetics",
  description: "Search and filter every Fortnite cosmetic by rarity, series, chapter, and shop availability.",
};

export default function BrowsePage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Browse</h1>
        <p className="mt-2 max-w-xl text-white/50">
          The full Fortnite cosmetic database — search, filter, and add anything to your collection.
        </p>
      </div>
      <CosmeticExplorer initial={{ type: "outfit", sort: "newest" }} />
    </div>
  );
}
