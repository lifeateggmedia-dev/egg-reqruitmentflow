"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationCenter } from "./notification-center";
import { useUnreadCount } from "@/providers/realtime-provider";

export function NotificationBell() {
  const unread = useUnreadCount();

  return (
    <Popover>
      <PopoverTrigger className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-zinc-100">
        <Bell className="h-5 w-5 text-zinc-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}
