import type { Metadata } from "next";
import { getStarterLoadout } from "@/lib/fortnite";
import { LockerClient } from "@/components/locker/LockerClient";

export const metadata: Metadata = {
  title: "Locker",
  description: "Build and preview Fortnite outfit combinations in a real-time 3D viewer.",
};

// Revalidate the starter loadout hourly.
export const revalidate = 3600;

export default async function LockerPage() {
  const starter = await getStarterLoadout();
  return <LockerClient starter={starter} />;
}
