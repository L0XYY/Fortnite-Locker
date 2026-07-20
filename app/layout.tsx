import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fortnite Locker Studio",
    template: "%s · Locker Studio",
  },
  description:
    "Design Fortnite lockers, preview outfit combos in a real-time 3D viewer, track the Item Shop, and know exactly what your collection is worth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteNav />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
