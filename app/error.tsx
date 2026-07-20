"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="glass-strong mx-auto mt-16 max-w-md rounded-4xl px-6 py-20 text-center">
      <p className="font-display text-2xl font-bold">Something went wrong</p>
      <p className="mt-2 text-sm text-white/50">
        We couldn&apos;t reach the Fortnite data service. This usually clears up in a moment.
      </p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
