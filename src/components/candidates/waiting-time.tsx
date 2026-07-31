"use client";

import { useNow } from "@/lib/hooks/use-now";
import { waitingMinutes } from "@/lib/utils";
import { WAITING_TIME_WARN, WAITING_TIME_DANGER } from "@/lib/constants";

export function WaitingTime({ arrivalTime }: { arrivalTime: string }) {
  useNow();
  const minutes = waitingMinutes(arrivalTime);

  const color =
    minutes >= WAITING_TIME_DANGER
      ? "text-rose-600"
      : minutes >= WAITING_TIME_WARN
        ? "text-amber-600"
        : "text-zinc-500";

  if (minutes < 0) return null;

  return (
    <span className={`text-xs font-medium ${color}`}>
      {minutes <= 1 ? "Baru datang" : `${Math.floor(minutes)} mnt`}
    </span>
  );
}
