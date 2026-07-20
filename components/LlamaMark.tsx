/** The Fortnite Loot Llama — the app's brand mark. */
export function LlamaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="llamaTeal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#40E4F2" />
          <stop offset="1" stopColor="#12A2C0" />
        </linearGradient>
      </defs>
      {/* legs */}
      <rect x="16" y="41" width="6" height="17" rx="3" fill="#7C3AED" />
      <rect x="25" y="41" width="6" height="17" rx="3" fill="#6D28D9" />
      <rect x="37" y="41" width="6" height="17" rx="3" fill="#7C3AED" />
      <rect x="46" y="41" width="6" height="17" rx="3" fill="#6D28D9" />
      {/* neck */}
      <path d="M15 32 L22 32 L19 13 L11 14 Z" fill="url(#llamaTeal)" />
      {/* body */}
      <rect x="12" y="25" width="44" height="23" rx="11" fill="url(#llamaTeal)" />
      {/* saddle pack */}
      <path d="M39 26 h11 a3 3 0 0 1 3 3 v6 h-17 v-6 a3 3 0 0 1 3 -3 z" fill="#7C3AED" />
      <rect x="40" y="30" width="10" height="2.4" rx="1.2" fill="#B794F6" />
      {/* head */}
      <rect x="4" y="5" width="17" height="16" rx="6.5" fill="url(#llamaTeal)" />
      {/* ears */}
      <path d="M8 6 L5.5 -0.5 L12 4 Z" fill="#6D28D9" />
      <path d="M17 5 L18.5 -1 L22 4.5 Z" fill="#6D28D9" />
      {/* snout */}
      <rect x="2" y="13" width="8" height="7" rx="3.5" fill="#F3ECDA" />
      <circle cx="5" cy="16.5" r="1" fill="#0b0b12" />
      {/* eye */}
      <circle cx="12" cy="12" r="1.8" fill="#0b0b12" />
      {/* piñata diamonds */}
      <path d="M27 33 l4.5 5.5 l-4.5 5.5 l-4.5 -5.5 z" fill="#FF4FA3" />
      <path d="M38 33 l4.5 5.5 l-4.5 5.5 l-4.5 -5.5 z" fill="#FFC24B" />
    </svg>
  );
}
