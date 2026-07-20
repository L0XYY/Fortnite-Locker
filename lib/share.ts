// Encode/decode a locker loadout into a URL-safe string so lockers can be
// shared as a link with no backend. Shape: { slotKey: cosmeticId }.

export type LoadoutIds = Record<string, string>;

export function encodeLoadout(ids: LoadoutIds): string {
  const json = JSON.stringify(ids);
  const b64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeLoadout(str: string): LoadoutIds {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof window === "undefined" ? Buffer.from(b64, "base64").toString() : decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed as LoadoutIds;
  } catch {
    /* invalid link */
  }
  return {};
}
