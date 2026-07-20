// ---------------------------------------------------------------------------
// V-Bucks → real-money conversion + multi-currency formatting.
//
// Everything in the Fortnite Item Shop is priced in V-Bucks, which are bought
// with real money.  We estimate the cash cost from Epic's V-Bucks pack pricing
// (1,000 V-Bucks ≈ US$7.99) and then convert USD → any currency with live FX.
// ---------------------------------------------------------------------------

/** USD per V-Buck, from the 1,000 V-Bucks = $7.99 base pack. */
export const USD_PER_VBUCK = 7.99 / 1000;

/** Reference used in the UI note. */
export const VBUCK_REFERENCE = "1,000 V-Bucks ≈ $7.99";

export function vbucksToUsd(vbucks: number | null | undefined): number | null {
  if (vbucks == null) return null;
  return vbucks * USD_PER_VBUCK;
}

export interface CurrencyDef {
  code: string;
  name: string;
  flag: string;
}

/** Popular currencies offered in the picker (live rate comes from /api/rates). */
export const CURRENCIES: CurrencyDef[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Złoty", flag: "🇵🇱" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "ARS", name: "Argentine Peso", flag: "🇦🇷" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
];

export const CURRENCY_BY_CODE: Record<string, CurrencyDef> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
);

export type Rates = Record<string, number>;

/** Format a USD amount in `code`, using live `rates` (USD-based). */
export function formatMoney(usd: number | null, code: string, rates: Rates | null): string | null {
  if (usd == null) return null;
  const rate = code === "USD" ? 1 : rates?.[code];
  if (rate == null) return null;
  const value = usd * rate;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}
