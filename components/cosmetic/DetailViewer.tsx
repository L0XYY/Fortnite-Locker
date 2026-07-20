"use client";

import { useState } from "react";
import { ImageIcon, Clapperboard, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CosmeticShowcase } from "@/components/CosmeticShowcase";

export function DetailViewer({
  imageUrl,
  color,
  showcaseVideo,
}: {
  imageUrl: string;
  color: string;
  showcaseVideo?: string | null;
}) {
  const [mode, setMode] = useState<"image" | "video">("image");

  return (
    <>
      {mode === "video" && showcaseVideo ? (
        <div className="absolute inset-0 bg-black">
          <iframe
            key={showcaseVideo}
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${showcaseVideo}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title="3D showcase"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <CosmeticShowcase imageUrl={imageUrl} color={color} eager className="absolute inset-0" />
      )}

      {/* Mode toggle (only when a showcase video exists) */}
      {showcaseVideo && (
        <div className="absolute left-3 top-3 z-20">
          <div className="glass flex items-center gap-1 rounded-full p-1">
            <Seg active={mode === "image"} onClick={() => setMode("image")} icon={ImageIcon} label="Image" />
            <Seg active={mode === "video"} onClick={() => setMode("video")} icon={Clapperboard} label="3D Showcase" />
          </div>
        </div>
      )}

      {/* Bottom hint */}
      {showcaseVideo && mode === "image" && (
        <button
          onClick={() => setMode("video")}
          className="glass absolute inset-x-0 bottom-3 z-20 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80 transition hover:text-white"
        >
          <Play className="h-3.5 w-3.5" /> Watch the real 3D model
        </button>
      )}
      {mode === "video" && (
        <div className="glass absolute inset-x-0 bottom-3 z-20 mx-auto w-fit rounded-full px-3 py-1.5 text-[11px] text-white/50">
          The real in-game 3D model, in motion · showcase footage
        </div>
      )}
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
