# Fortnite Locker Studio

A premium Fortnite cosmetic companion — design lockers, preview outfit combos in a
3D‑style viewer, browse the full cosmetic database, track the live Item Shop, and know
what your collection is worth. Built with a VisionOS‑inspired glass aesthetic.

> Fan‑made project. Cosmetic data & official renders come from the free, key‑less
> [fortnite‑api.com](https://fortnite-api.com). Not affiliated with or endorsed by Epic Games.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

No API keys or environment variables are required — it works out of the box.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** (glassmorphism design system) + **Framer Motion** (page transitions, scroll reveals, 60fps)
- **Three.js** + **React Three Fiber** + **drei** — the real‑time WebGL 3D cosmetic viewer (lazy‑loaded)
- **Zustand** with `persist` for local‑first state (locker, collection, presets)
- Live data via the **fortnite‑api.com** v2 endpoints, cached with the Next fetch cache
  plus an in‑process memo so thousands of cosmetics never re‑serialize per request.

## Features

| Area | What it does |
|------|--------------|
| **Home** | Hero, live stats, featured skins, set‑based trending combos, today's Item Shop |
| **Locker** | Equip 7 slots, premium 3D‑style viewer (drag‑rotate, zoom, lighting, 4 backgrounds, auto‑spin), Combo Score rating, saved presets, randomize, shareable links |
| **Browse** | Search 15.8k+ cosmetics with rarity / series / chapter / shop filters + infinite scroll |
| **Item Shop** | The real shop grouped by section with live V‑Bucks pricing + real‑money cost |
| **Currency converter** | Global currency picker (30 currencies, live FX) — every V‑Bucks price also shown as real cash; bundles show their IRL cost |
| **Cosmetic pages** | Rarity, series, set, introduction, shop status/price, rarity‑value meter, "more from this set" |
| **Collection** | Mark owned / wishlist / favorite, type breakdown, tracked value, completion % |
| **Profile** | Editable name, saved lockers, favorites, collection stats |

### Combo Score
`lib/rating.ts` is a transparent heuristic (not an ML model): it scores set cohesion,
rarity/series value, slot completeness, and color harmony (hue clustering) into a 0–10
score with an explanation and a style label.

### Sharing without a backend
A locker is encoded into the URL (`/l/<base64>`), so `Share` produces a link anyone can
open read‑only and "Open in Studio" — no database needed.

## Project structure

```
app/            routes (home, locker, browse, shop, cosmetic/[id], collection, profile, l/[data])
  api/cosmetics route handler: server‑side filtered + paginated feed
components/      UI kit, locker (stage/picker/rating), home, collection, profile
lib/            fortnite.ts (data layer), rating.ts, filters.ts, share.ts, utils.ts
store/          useStudio.ts (persisted Zustand store)
```

## Honest limitations & upgrade path

- **3D character models:** the viewer is a real **WebGL 3D scene** (React Three Fiber) — a
  rotating pedestal, real‑time lights, contact shadows, particles and orbit/zoom controls.
  Epic doesn't publish rigged 3D skin *meshes* in any public API, so the character itself is
  the official hi‑res render presented as a lit standee inside that 3D diorama. If Epic ever
  exposes GLB meshes, only `components/locker/Cosmetic3DViewer.tsx` changes.
- **Accounts & sync:** Discord/email login and cloud saves need a NextAuth + Postgres/Prisma
  backend and OAuth credentials you provision. Today, everything persists to `localStorage`
  via Zustand. The UI reads/writes through the store, so replacing the persist layer with API
  calls is a localized change.
- **Deep shop history:** the community API exposes the *live* shop and per‑item intro dates,
  but not full historical appearance logs — so pages show real availability/price/intro data
  and a rarity‑value meter rather than fabricated appearance counts.
