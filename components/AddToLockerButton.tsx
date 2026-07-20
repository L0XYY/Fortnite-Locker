"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Check } from "lucide-react";
import type { Cosmetic } from "@/lib/fortnite";
import { useStudio } from "@/store/useStudio";
import { SLOTS } from "@/lib/utils";

export function AddToLockerButton({ cosmetic }: { cosmetic: Cosmetic }) {
  const router = useRouter();
  const equip = useStudio((s) => s.equip);
  const [done, setDone] = useState(false);
  const slot = SLOTS.find((s) => s.type === cosmetic.type);
  if (!slot) return null;

  return (
    <button
      onClick={() => {
        equip(slot.key, cosmetic);
        setDone(true);
        setTimeout(() => router.push("/locker"), 550);
      }}
      className="btn-primary w-full py-3 text-base"
    >
      {done ? <Check className="h-5 w-5" /> : <Boxes className="h-5 w-5" />}
      {done ? "Added — opening locker…" : `Equip in ${slot.label} slot`}
    </button>
  );
}
