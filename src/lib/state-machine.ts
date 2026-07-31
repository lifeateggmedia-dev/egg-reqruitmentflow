import type { CandidateStatus, UserRole } from "./types";

const TRANSITIONS: Record<UserRole, Partial<Record<CandidateStatus, CandidateStatus[]>>> = {
  admin_hr: {
    waiting: ["call_session_1", "session_1", "call_session_2", "session_2", "pending", "passed", "failed", "finished"],
    call_session_1: ["waiting", "session_1", "call_session_2", "session_2", "pending", "passed", "failed", "finished"],
    session_1: ["waiting", "call_session_1", "call_session_2", "session_2", "pending", "passed", "failed", "finished"],
    call_session_2: ["waiting", "call_session_1", "session_1", "session_2", "pending", "passed", "failed", "finished"],
    session_2: ["pending", "passed", "failed", "finished"],
    pending: ["passed", "failed", "finished"],
    passed: ["finished"],
    failed: ["finished"],
    finished: [],
  },
  frontliner: {
    call_session_1: ["session_1"],
    call_session_2: ["session_2"],
    passed: ["finished"],
    failed: ["finished"],
  },
  interviewer_1: {
    waiting: ["call_session_1"],
    session_1: ["call_session_2"],
  },
  owner: {
    session_2: ["pending", "passed", "failed"],
    pending: ["passed", "failed"],
  },
};

export function allowedTransitions(
  role: UserRole,
  status: CandidateStatus
): CandidateStatus[] {
  return TRANSITIONS[role]?.[status] ?? [];
}

export function canTransition(
  role: UserRole,
  from: CandidateStatus,
  to: CandidateStatus
): boolean {
  return allowedTransitions(role, from).includes(to);
}
