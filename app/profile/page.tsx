import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Locker Studio profile — saved lockers, favorites, and collection stats.",
};

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-6 pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Profile</h1>
      </div>
      <ProfileClient />
    </div>
  );
}
