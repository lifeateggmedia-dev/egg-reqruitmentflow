"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SidebarNav } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function TopBar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center gap-2 px-5 border-b border-zinc-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
                E
              </div>
              <span className="font-semibold text-sm text-zinc-900">EGG Recruitment</span>
            </div>
            <div className="p-3">
              <SidebarNav role={profile.role} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
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
