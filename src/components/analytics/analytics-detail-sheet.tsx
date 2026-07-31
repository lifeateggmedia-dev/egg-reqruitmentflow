"use client";

import { useMemo } from "react";
import { useCandidates } from "@/providers/realtime-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CandidateStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";
import { formatTime, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnalyticsDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  statuses: CandidateStatus[];
}

export function AnalyticsDetailSheet({ open, onOpenChange, label, statuses }: AnalyticsDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md">
        <DetailContent statuses={statuses} label={label} />
      </SheetContent>
    </Sheet>
  );
}

function DetailContent({ statuses, label }: { statuses: CandidateStatus[]; label: string }) {
  const candidates = useCandidates((c) => statuses.includes(c.current_status));

  const sorted = useMemo(
    () => [...candidates].sort((a, b) => new Date(b.arrival_time).getTime() - new Date(a.arrival_time).getTime()),
    [candidates]
  );

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="shrink-0">
        <SheetTitle className="text-base font-semibold">{label} ({candidates.length})</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto mt-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center">Tidak ada kandidat</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((c) => {
              const meta = STATUS_META[c.current_status];
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {c.queue_number} — {c.full_name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {c.position} · {formatDate(c.arrival_time)} · {formatTime(c.arrival_time)}
                    </p>
                  </div>
                  <Badge variant={meta.variant} className="text-xs">
                    {meta.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
