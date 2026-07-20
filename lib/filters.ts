// Filter option catalogs for Browse + the locker picker. Series values use the
// exact strings returned by the API (matched case-insensitively downstream).

export interface Option {
  value: string;
  label: string;
}

export const TYPE_OPTIONS: Option[] = [
  { value: "", label: "All types" },
  { value: "outfit", label: "Outfits" },
  { value: "backpack", label: "Back Blings" },
  { value: "pickaxe", label: "Pickaxes" },
  { value: "glider", label: "Gliders" },
  { value: "emote", label: "Emotes" },
  { value: "wrap", label: "Wraps" },
  { value: "contrail", label: "Contrails" },
  { value: "loadingscreen", label: "Loading Screens" },
];

export const RARITY_OPTIONS: Option[] = [
  { value: "", label: "Any rarity" },
  { value: "legendary", label: "Legendary" },
  { value: "epic", label: "Epic" },
  { value: "rare", label: "Rare" },
  { value: "uncommon", label: "Uncommon" },
  { value: "common", label: "Common" },
  { value: "mythic", label: "Mythic" },
];

export const SERIES_OPTIONS: Option[] = [
  { value: "", label: "Any series" },
  { value: "Icon Series", label: "Icon Series" },
  { value: "MARVEL SERIES", label: "Marvel" },
  { value: "DC SERIES", label: "DC" },
  { value: "Gaming Legends Series", label: "Gaming Legends" },
  { value: "Star Wars Series", label: "Star Wars" },
  { value: "CREW SERIES", label: "Crew" },
  { value: "Slurp Series", label: "Slurp" },
  { value: "Frozen Series", label: "Frozen" },
  { value: "Lava Series", label: "Lava" },
  { value: "DARK SERIES", label: "Dark" },
  { value: "Shadow Series", label: "Shadow" },
];

export const SEASON_OPTIONS: Option[] = [
  { value: "", label: "Any chapter" },
  ...["1", "2", "3", "4", "5", "6", "7"].map((c) => ({ value: c, label: `Chapter ${c}` })),
];

export const SORT_OPTIONS: Option[] = [
  { value: "newest", label: "Newest" },
  { value: "rarity", label: "Rarity" },
  { value: "name", label: "A–Z" },
  { value: "price", label: "Price" },
];
