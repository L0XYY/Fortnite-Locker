"use client";

import { useState } from "react";
import { Sparkles, User, Maximize2, Clapperboard, X, Layers3 } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { cosmeticTone, alpha, cn, SLOTS } from "@/lib/utils";
import { CosmeticImage } from "@/components/CosmeticImage";
import { CosmeticShowcase } from "@/components/CosmeticShowcase";

type Loadout = Record<string, Cosmetic | null | undefined>;
type Bg = "lobby" | "studio" | "grid" | "void";

const BACKGROUNDS: { key: Bg; label: string }[] = [
  { key: "lobby", label: "Lobby" },
  { key: "studio", label: "Studio" },
  { key: "grid", label: "Grid" },
  { key: "void", label: "Void" },
];

export function LockerStage({
  loadout,
  onPickSlot,
}: {
  loadout: Loadout;
  onPickSlot?: (slot: string) => void;
}) {
  const outfit = loadout.outfit || null;
  const tone = outfit ? cosmeticTone(outfit) : { color: "#8b8bff", label: "", order: 0 };

  const [bg, setBg] = useState<Bg>("lobby");
  const [fullBody, setFullBody] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const floatSlots = SLOTS.filter((s) => s.key !== "outfit" && s.key !== "contrail" && s.key !== "emote");
  const imageUrl = outfit ? (fullBody && outfit.featured ? outfit.featured : outfit.image) : "";

  return (
    <div className="glass-strong relative overflow-hidden rounded-4xl">
      <StageBackground bg={bg} color={tone.color} />

      {/* Floating equipped item chips */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block">
        {floatSlots.map((s, i) => {
          const item = loadout[s.key] || null;
          const pos = ["left-4 top-4", "right-4 top-4", "left-4 bottom-24", "right-4 bottom-24"][i];
          return (
            <button
              key={s.key}
              onClick={() => onPickSlot?.(s.key)}
              className={cn(
                "pointer-events-auto absolute flex w-36 items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-black/60",
                pos,
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5">
                {item ? <CosmeticImage cosmetic={item} className="h-full w-full" /> : <Sparkles className="h-4 w-4 text-white/30" />}
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[10px] uppercase tracking-wide text-white/40">{s.label}</span>
                <span className="block truncate text-xs font-semibold">{item?.name || "Empty"}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Showcase */}
      <div className="relative z-10 h-[460px] sm:h-[560px]">
        {outfit ? (
          <CosmeticShowcase key={imageUrl} imageUrl={imageUrl} color={tone.color} eager className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/5">
                <User className="h-10 w-10 text-white/30" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold">No outfit equipped</p>
              <p className="mt-1 text-sm text-white/45">Pick an outfit from the panel to start building.</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-3">
        <div className="glass mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-full px-3 py-2">
          <StageBtn active={fullBody} onClick={() => setFullBody((v) => !v)} icon={fullBody ? Maximize2 : User} label={fullBody ? "Full body" : "Portrait"} />
          {outfit?.showcaseVideo && (
            <StageBtn onClick={() => setShowVideo(true)} icon={Clapperboard} label="3D Showcase" />
          )}
          <div className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-1 rounded-full bg-black/30 p-1">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.key}
                onClick={() => setBg(b.key)}
                className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition", bg === b.key ? "bg-white text-ink-950" : "text-white/50 hover:text-white")}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        {outfit?.showcaseVideo && (
          <p className="mt-2 hidden text-center text-[11px] text-white/30 sm:block">
            <Layers3 className="mr-1 inline h-3 w-3" />
            Tap 3D Showcase to see the real in-game model in motion
          </p>
        )}
      </div>

      {/* Official 3D showcase video */}
      {showVideo && outfit?.showcaseVideo && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{outfit.name} · 3D showcase</p>
              <button onClick={() => setShowVideo(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                key={outfit.showcaseVideo}
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${outfit.showcaseVideo}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={`${outfit.name} 3D showcase`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StageBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95",
        active ? "bg-white text-ink-950" : "text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StageBackground({ bg, color }: { bg: Bg; color: string }) {
  if (bg === "void") {
    return <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #141419, #050506 70%)" }} />;
  }
  if (bg === "grid") {
    return (
      <div className="absolute inset-0" style={{ background: "#07070a" }}>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(circle at 50% 45%, black, transparent 75%)",
          }}
        />
      </div>
    );
  }
  if (bg === "studio") {
    return (
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#101014,#050506)" }}>
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: `radial-gradient(60% 100% at 50% 100%, ${alpha(color, 0.3)}, transparent)` }} />
      </div>
    );
  }
  // lobby — soft ambient glow, no rings/swirls
  return (
    <div className="absolute inset-0" style={{ background: "#070709" }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 55% at 50% 40%, ${alpha(color, 0.28)}, transparent 72%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: `radial-gradient(70% 100% at 50% 120%, ${alpha(color, 0.22)}, transparent)` }} />
    </div>
  );
}
