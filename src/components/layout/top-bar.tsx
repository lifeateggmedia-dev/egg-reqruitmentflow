"use client";

import type { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <span className="text-xs font-medium text-zinc-400 bg-zinc-100 rounded-full px-2.5 py-0.5">
          {ROLE_LABELS[profile.role]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
