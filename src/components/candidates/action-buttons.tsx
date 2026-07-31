"use client";

import { useState, useMemo } from "react";
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

const SESSION_2_DECISIONS: CandidateStatus[] = ["pending", "passed", "failed"];

export function ActionButtons({ candidate, role }: ActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const transitions = allowedTransitions(role, candidate.current_status);

  const assessmentSession = useMemo(() => {
    if (role === "interviewer_1" && transitions.includes("call_session_2")) {
      return "session_1" as const;
    }
    if (role === "owner" && SESSION_2_DECISIONS.some((s) => transitions.includes(s))) {
      return "session_2" as const;
    }
    return null;
  }, [role, transitions]);

  const isSession2Decision = assessmentSession === "session_2";

  const directTransitions = isSession2Decision
    ? []
    : transitions.filter((t) => t !== "call_session_2");

  const handleTransition = async (to: CandidateStatus, note?: string) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await transitionCandidateStatus(supabase, candidate.id, to, note);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Status: ${STATUS_META[to].label}`);
      setAssessmentOpen(false);
    }
  };

  const handleAssessmentSubmit = (note: string, decision: CandidateStatus) => {
    handleTransition(decision, note);
  };

  if (transitions.length === 0) return null;

  return (
    <>
      <div className="flex gap-1.5">
        {isSession2Decision && (
          <button
            onClick={() => setAssessmentOpen(true)}
            disabled={loading}
            className="inline-flex items-center rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "..." : "Putuskan"}
          </button>
        )}

        {assessmentSession === "session_1" && (
          <button
            onClick={() => setAssessmentOpen(true)}
            disabled={loading}
            className="inline-flex items-center rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "..." : "Kirim ke Session 2"}
          </button>
        )}

        {directTransitions.map((to) => {
          const meta = STATUS_META[to];
          const label = BUTTON_OVERRIDES[to] ?? meta.label;
          return (
            <button
              key={to}
              onClick={() => handleTransition(to)}
              disabled={loading}
              className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                to === "passed"
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : to === "failed"
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {assessmentOpen && (
        <AssessmentDialog
          open={assessmentOpen}
          onOpenChange={(open) => !open && setAssessmentOpen(false)}
          candidate={candidate}
          targetStatus={assessmentSession === "session_1" ? "call_session_2" : "session_2"}
          session={assessmentSession!}
          loading={loading}
          onSubmit={handleAssessmentSubmit}
        />
      )}
    </>
  );
}
