"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { transitionCandidateStatus } from "@/lib/supabase/rpc";
import { allowedTransitions } from "@/lib/state-machine";
import { STATUS_META } from "@/lib/constants";
import type { Candidate, CandidateStatus, UserRole } from "@/lib/types";
import { AssessmentDialog } from "@/components/interview/assessment-dialog";

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

// Transitions that should show the assessment dialog
const ASSESSMENT_TRANSITIONS: CandidateStatus[] = [
  "call_session_2", // Interviewer 1 → Session 2
  "passed",         // Owner → Lolos
  "failed",         // Owner → Tidak Lolos
];

export function ActionButtons({ candidate, role }: ActionButtonsProps) {
  const [loading, setLoading] = useState<CandidateStatus | null>(null);
  const [dialogTransition, setDialogTransition] = useState<CandidateStatus | null>(null);
  const transitions = allowedTransitions(role, candidate.current_status);

  if (transitions.length === 0) return null;

  const handleTransition = async (to: CandidateStatus, note?: string) => {
    setLoading(to);
    const supabase = createClient();
    const { error } = await transitionCandidateStatus(supabase, candidate.id, to, note);
    setLoading(null);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Status: ${STATUS_META[to].label}`);
      setDialogTransition(null);
    }
  };

  const onButtonClick = (to: CandidateStatus) => {
    if (ASSESSMENT_TRANSITIONS.includes(to)) {
      setDialogTransition(to);
    } else {
      handleTransition(to);
    }
  };

  return (
    <>
      <div className="flex gap-1.5">
        {transitions.map((to) => {
          const meta = STATUS_META[to];
          const label = BUTTON_OVERRIDES[to] ?? meta.label;
          const isLoading = loading === to;
          return (
            <button
              key={to}
              onClick={() => onButtonClick(to)}
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

      {dialogTransition && (
        <AssessmentDialog
          open={!!dialogTransition}
          onOpenChange={(open) => !open && setDialogTransition(null)}
          candidate={candidate}
          targetStatus={dialogTransition}
          loading={loading === dialogTransition}
          onSubmit={(note) => handleTransition(dialogTransition, note)}
        />
      )}
    </>
  );
}
