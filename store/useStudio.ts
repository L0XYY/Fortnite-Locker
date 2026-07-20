"use client";

// ---------------------------------------------------------------------------
// Persistent client store (localStorage).  Holds the working locker, saved
// presets, and the user's collection / favorites / wishlist.  Structured so a
// real backend can later replace the persist layer without touching the UI.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Cosmetic } from "@/lib/fortnite";

export interface Preset {
  id: string;
  name: string;
  createdAt: number;
  loadout: Record<string, Cosmetic | null>;
}

interface StudioState {
  displayName: string;
  currency: string;
  locker: Record<string, Cosmetic | null>;
  presets: Preset[];
  owned: string[];
  favorites: string[];
  wishlist: string[];
  /** Slim cache of every cosmetic the user has touched, for offline rendering. */
  catalog: Record<string, Cosmetic>;
  _hydrated: boolean;

  setName: (name: string) => void;
  setCurrency: (code: string) => void;
  equip: (slot: string, c: Cosmetic | null) => void;
  clearLocker: () => void;
  applyLoadout: (loadout: Record<string, Cosmetic | null>) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  toggleOwned: (c: Cosmetic) => void;
  toggleFavorite: (c: Cosmetic) => void;
  toggleWishlist: (c: Cosmetic) => void;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      displayName: "Player",
      currency: "USD",
      locker: {},
      presets: [],
      owned: [],
      favorites: [],
      wishlist: [],
      catalog: {},
      _hydrated: false,

      setName: (name) => set({ displayName: name.slice(0, 24) || "Player" }),
      setCurrency: (code) => set({ currency: code }),

      equip: (slot, c) =>
        set((s) => ({
          locker: { ...s.locker, [slot]: c },
          catalog: c ? { ...s.catalog, [c.id]: c } : s.catalog,
        })),

      clearLocker: () => set({ locker: {} }),

      applyLoadout: (loadout) => set({ locker: { ...loadout } }),

      savePreset: (name) =>
        set((s) => {
          const loadout = { ...s.locker };
          const preset: Preset = {
            id: `p_${Date.now().toString(36)}`,
            name: name.trim() || `Locker ${s.presets.length + 1}`,
            createdAt: Date.now(),
            loadout,
          };
          return { presets: [preset, ...s.presets].slice(0, 40) };
        }),

      deletePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),

      toggleOwned: (c) =>
        set((s) => ({ owned: toggle(s.owned, c.id), catalog: { ...s.catalog, [c.id]: c } })),
      toggleFavorite: (c) =>
        set((s) => ({ favorites: toggle(s.favorites, c.id), catalog: { ...s.catalog, [c.id]: c } })),
      toggleWishlist: (c) =>
        set((s) => ({ wishlist: toggle(s.wishlist, c.id), catalog: { ...s.catalog, [c.id]: c } })),
    }),
    {
      name: "fls-studio-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        displayName: s.displayName,
        currency: s.currency,
        locker: s.locker,
        presets: s.presets,
        owned: s.owned,
        favorites: s.favorites,
        wishlist: s.wishlist,
        catalog: s.catalog,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    },
  ),
);

/** True once localStorage has rehydrated — gate persisted UI on this to avoid
 *  hydration mismatches. */
export function useHydrated(): boolean {
  return useStudio((s) => s._hydrated);
}
