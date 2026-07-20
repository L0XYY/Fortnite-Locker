import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 pb-10">
      <div className="glass flex flex-col items-start justify-between gap-4 rounded-3xl px-6 py-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-bold">Fortnite Locker Studio</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-white/45">
            A fan-made companion. Cosmetic data &amp; renders via the free{" "}
            <a
              href="https://fortnite-api.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/70 underline underline-offset-2 hover:text-white"
            >
              fortnite-api.com
            </a>
            . Not affiliated with or endorsed by Epic Games.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/55">
          <Link href="/locker" className="hover:text-white">Locker</Link>
          <Link href="/browse" className="hover:text-white">Browse</Link>
          <Link href="/shop" className="hover:text-white">Item Shop</Link>
          <Link href="/collection" className="hover:text-white">Collection</Link>
        </nav>
      </div>
    </footer>
  );
}
