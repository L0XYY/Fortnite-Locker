"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Orbit, RotateCcw, Loader2, Play, Box, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Cosmetic3DViewer = dynamic(
  () => import("@/components/locker/Cosmetic3DViewer").then((m) => m.Cosmetic3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    ),
  },
);

export function DetailViewer({
  imageUrl,
  color,
  showcaseVideo,
}: {
  imageUrl: string;
  color: string;
  showcaseVideo?: string | null;
}) {
  const [mode, setMode] = useState<"model" | "video">("model");
  const [spin, setSpin] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      {mode === "video" && showcaseVideo ? (
        <div className="absolute inset-0 bg-black">
          <iframe
            key={showcaseVideo}
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${showcaseVideo}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title="Official 3D showcase"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="absolute inset-0">
          <Cosmetic3DViewer imageUrl={imageUrl} color={color} spin={spin} light={62} resetSignal={resetKey} />
        </div>
      )}

      {/* Mode toggle (only when a showcase video exists) */}
      {showcaseVideo && (
        <div className="absolute left-3 top-3 z-20">
          <div className="glass flex items-center gap-1 rounded-full p-1">
            <Seg active={mode === "model"} onClick={() => setMode("model")} icon={Box} label="Interactive" />
            <Seg active={mode === "video"} onClick={() => setMode("video")} icon={Clapperboard} label="3D Showcase" />
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center">
        {mode === "model" ? (
          <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5">
            <Ctl active={spin} onClick={() => setSpin((v) => !v)} icon={Orbit} label="Spin" />
            <Ctl onClick={() => setResetKey((k) => k + 1)} icon={RotateCcw} label="Reset" />
            {showcaseVideo && <Ctl onClick={() => setMode("video")} icon={Play} label="3D Showcase" />}
            <span className="hidden px-2 text-[11px] text-white/35 sm:inline">Drag · scroll to zoom</span>
          </div>
        ) : (
          <div className="glass rounded-full px-3 py-1.5 text-[11px] text-white/50">
            The real in-game 3D model, in motion · showcase footage
          </div>
        )}
      </div>
    </>
  );
}

function Seg({
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
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active ? "bg-white text-ink-950" : "text-white/60 hover:text-white",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function Ctl({
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
      <Icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
