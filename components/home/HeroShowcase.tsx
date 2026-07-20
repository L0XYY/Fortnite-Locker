"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone, alpha } from "@/lib/utils";
import { RarityBadge } from "@/components/RarityBadge";

export function HeroShowcase({ outfits }: { outfits: Cosmetic[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = outfits[i % outfits.length];
  const tone = current ? cosmeticTone(current) : { color: "#8b8bff", label: "", order: 0 };

  const rx = useSpring(useMotionValue(0), { stiffness: 100, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 100, damping: 18 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || outfits.length < 2) return;
    const t = setInterval(() => setI((v) => v + 1), 4200);
    return () => clearInterval(t);
  }, [paused, outfits.length]);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 22);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  }

  if (!current) return null;

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      onPointerEnter={() => setPaused(true)}
      onPointerDown={() => setPaused(true)}
      className="perspective relative mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center"
    >
      <div
        className="absolute inset-6 rounded-[40%] blur-3xl transition-colors duration-700"
        style={{ background: alpha(tone.color, 0.45) }}
      />
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Link href={`/cosmetic/${current.id}`} className="animate-float block h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.featured || current.image}
                alt={current.name}
                className="mx-auto h-full w-full object-contain drop-shadow-2xl"
                draggable={false}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="glass absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full py-1.5 pl-2 pr-4">
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image} alt="" className="h-full w-full object-contain" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">{current.name}</p>
          <div className="mt-0.5"><RarityBadge cosmetic={current} className="!px-1.5 !py-0.5 !text-[9px]" /></div>
        </div>
      </div>

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
        {outfits.slice(0, 6).map((o, idx) => (
          <button
            key={o.id}
            onClick={() => { setI(idx); setPaused(true); }}
            aria-label={o.name}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: idx === i % outfits.length ? 20 : 6,
              background: idx === i % outfits.length ? tone.color : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
