"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { transitionCandidateStatus } from "@/lib/supabase/rpc";
import { allowedTransitions } from "@/lib/state-machine";
import { STATUS_META } from "@/lib/constants";
import type { Candidate, CandidateStatus, UserRole } from "@/lib/types";

interface ActionButtonsProps {
  candidate: Candidate;
  role: UserRole;
}

const BUTTON_OVERRIDES: Partial<Record<CandidateStatus, string>> = {
  call_session_1: "Sudah Diarahkan",
  call_session_2: "Sudah Diarahkan",
  passed: "Selesai",
  failed: "Selesai",
};

export function ActionButtons({ candidate, role }: ActionButtonsProps) {
  const [loading, setLoading] = useState<CandidateStatus | null>(null);
  const transitions = allowedTransitions(role, candidate.current_status);

  if (transitions.length === 0) return null;

  const handleTransition = async (to: CandidateStatus) => {
    setLoading(to);
    const supabase = createClient();
    const { error } = await transitionCandidateStatus(supabase, candidate.id, to);
    setLoading(null);
    if (error) {
      toast.error(error);
    }
  };

  return (
    <div className="flex gap-1.5">
      {transitions.map((to) => {
        const meta = STATUS_META[to];
        const label = BUTTON_OVERRIDES[to] ?? meta.label;
        const isLoading = loading === to;
        return (
          <button
            key={to}
            onClick={() => handleTransition(to)}
            disabled={!!loading}
            className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              to === "passed"
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : to === "failed"
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {isLoading ? "..." : label}
          </button>
        );
      })}
    </div>
  );
}
