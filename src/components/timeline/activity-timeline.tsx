import type { ActivityLog } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

const ACTION_LABELS: Record<string, string> = {
  check_in: "Check In",
  status_change: "Status berubah",
};

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">Belum ada aktivitas</p>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 py-2.5">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-zinc-300" />
            <div className="flex-1 w-px bg-zinc-200" />
          </div>
          <div className="flex-1 pb-2">
            <p className="text-sm text-zinc-900">
              {ACTION_LABELS[log.action] ?? log.action}
              {log.old_status && log.new_status && (
                <span className="text-zinc-500">
                  {" "}
                  : {STATUS_META[log.old_status]?.label ?? log.old_status} →{" "}
                  {STATUS_META[log.new_status]?.label ?? log.new_status}
                </span>
              )}
            </p>
            {log.note && <p className="text-xs text-zinc-400 mt-0.5">{log.note}</p>}
            <p className="text-[10px] text-zinc-400 mt-0.5">{formatTime(log.created_at)}</p>
          </div>
        </div>
      ))}
      {/* Close the last line */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-zinc-300" />
        </div>
        <div />
      </div>
    </div>
  );
}
