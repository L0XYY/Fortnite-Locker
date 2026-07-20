"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { alpha, cn } from "@/lib/utils";

/** Clean, premium 2D cosmetic showcase — rarity glow, gentle float, mouse
 *  parallax, soft ground shadow. No 3D pedestal, no ring. */
export function CosmeticShowcase({
  imageUrl,
  color,
  className,
  eager,
}: {
  imageUrl: string;
  color: string;
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 90, damping: 18, mass: 0.6 });
  const ry = useSpring(useMotionValue(0), { stiffness: 90, damping: 18, mass: 0.6 });
  const gx = useTransform(ry, (v) => v * -2.2);
  const gy = useTransform(rx, (v) => v * 2.2);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={cn("perspective relative flex items-center justify-center overflow-hidden", className)}
    >
      {/* rarity glow (parallax + breathing) */}
      <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ x: gx, y: gy }}>
        <div
          className="h-[68%] w-[68%] rounded-full blur-3xl animate-glow-pulse"
          style={{ background: `radial-gradient(circle, ${alpha(color, 0.85)}, ${alpha(color, 0.15)} 55%, transparent 72%)` }}
        />
      </motion.div>

      {/* character */}
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative flex h-full w-full items-center justify-center"
      >
        <div className="flex h-full w-full items-center justify-center animate-float">
          <motion.img
            key={imageUrl}
            src={imageUrl}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[94%] w-auto max-w-[86%] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
          />
        </div>
      </motion.div>

      {/* soft ground shadow */}
      <div className="pointer-events-none absolute bottom-[7%] left-1/2 h-5 w-2/5 -translate-x-1/2 rounded-[50%] bg-black/55 blur-xl" />
    </div>
  );
}
