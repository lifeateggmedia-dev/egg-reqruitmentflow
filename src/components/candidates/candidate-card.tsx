import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { WaitingTime } from "./waiting-time";
import { ActionButtons } from "./action-buttons";
import type { Candidate, UserRole } from "@/lib/types";

interface CandidateCardProps {
  candidate: Candidate;
  role: UserRole;
}

export function CandidateCard({ candidate, role }: CandidateCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <Link href={`/candidates/${candidate.id}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidate.photo_url}
            alt={candidate.full_name}
            className="h-16 w-16 rounded-xl object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/candidates/${candidate.id}`}
                className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 truncate block"
              >
                {candidate.full_name}
              </Link>
              <p className="text-xs text-zinc-500 truncate">{candidate.position}</p>
            </div>
            <StatusBadge status={candidate.current_status} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-mono font-medium text-zinc-600">
                {candidate.queue_number}
              </span>
              <WaitingTime arrivalTime={candidate.arrival_time} />
            </div>
            <ActionButtons candidate={candidate} role={role} />
          </div>
        </div>
      </div>
    </div>
  );
}
