"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, Home, Search, ShoppingBag, User, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudio, useHydrated } from "@/store/useStudio";
import { LlamaMark } from "@/components/LlamaMark";
import { CurrencySelect } from "@/components/currency";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/locker", label: "Locker", icon: Boxes },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/shop", label: "Item Shop", icon: ShoppingBag },
  { href: "/collection", label: "Collection", icon: Layers },
];

export function SiteNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const name = useStudio((s) => s.displayName);
  const ownedCount = useStudio((s) => s.owned.length);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <nav className="glass-strong mx-auto flex max-w-7xl items-center gap-2 rounded-full px-2 py-2 shadow-glass">
        <Link href="/" className="group flex items-center gap-2.5 pl-2 pr-1">
          <Emblem />
          <span className="hidden font-display text-[15px] font-bold tracking-tight sm:block">
            Locker<span className="text-white/50"> Studio</span>
          </span>
        </Link>

        <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink-950" : "text-white/60 hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" strokeWidth={2.4} />
                <span className="relative z-10 hidden md:block">{label}</span>
              </Link>
            );
          })}
        </div>

        <CurrencySelect className="shrink-0" />

        <Link
          href="/profile"
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:bg-white/10"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-white/90 to-white/50 text-xs font-bold text-ink-950">
            {(hydrated ? name : "P").slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden text-xs font-semibold sm:block">
            {hydrated ? `${ownedCount} owned` : " "}
          </span>
          <User className="h-4 w-4 text-white/50 sm:hidden" />
        </Link>
      </nav>
    </header>
  );
}

function Emblem() {
  return (
    <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 shadow-glow shadow-cyan-500/30 ring-1 ring-white/10">
      <LlamaMark className="h-6 w-6" />
    </span>
  );
}
