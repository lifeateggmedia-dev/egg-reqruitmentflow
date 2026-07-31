"use client";

import { CheckCheck, BellOff } from "lucide-react";
import { useNotifications } from "@/providers/realtime-provider";
import { createClient } from "@/lib/supabase/client";
import { markNotificationsRead } from "@/lib/supabase/rpc";
import { timeAgo } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";
import type { AppNotification } from "@/lib/types";

export function NotificationCenter() {
  const notifications = useNotifications();

  const handleMarkAllRead = async () => {
    const supabase = createClient();
    await markNotificationsRead(supabase);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900">Notifikasi</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tandai semua dibaca
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <BellOff className="h-6 w-6 text-zinc-300" />
            <p className="text-sm text-zinc-400">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  return (
    <div
      className={`border-l-2 px-4 py-3 transition-colors ${
        notification.read
          ? "border-l-transparent bg-white"
          : `${PRIORITY_COLORS[notification.priority]} bg-zinc-50`
      }`}
    >
      <p className="text-sm font-medium text-zinc-900">{notification.title}</p>
      {notification.message && (
        <p className="mt-0.5 text-xs text-zinc-500">{notification.message}</p>
      )}
      <p className="mt-1 text-[10px] text-zinc-400">
        {timeAgo(notification.created_at)}
      </p>
    </div>
  );
}
