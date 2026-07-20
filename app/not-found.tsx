import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass-strong mx-auto mt-16 max-w-md rounded-4xl px-6 py-20 text-center">
      <p className="font-display text-6xl font-bold">404</p>
      <p className="mt-3 text-lg font-semibold">This page dropped out of the storm</p>
      <p className="mt-1 text-sm text-white/45">The cosmetic or page you&apos;re looking for isn&apos;t here.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
