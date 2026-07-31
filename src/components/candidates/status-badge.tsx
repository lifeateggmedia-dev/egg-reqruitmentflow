import type { CandidateStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";

export function StatusBadge({ status }: { status: CandidateStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color} bg-zinc-100`}>
      {meta.label}
    </span>
  );
}
