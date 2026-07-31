import { CandidateCard } from "./candidate-card";
import type { Candidate, UserRole } from "@/lib/types";

interface CandidateGridProps {
  candidates: Candidate[];
  role: UserRole;
  emptyMessage?: string;
}

export function CandidateGrid({
  candidates,
  role,
  emptyMessage = "Belum ada kandidat",
}: CandidateGridProps) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((c) => (
        <CandidateCard key={c.id} candidate={c} role={role} />
      ))}
    </div>
  );
}
