import type { Candidate, CandidateStatus, Profile, AppNotification, ActivityLog, AnalyticsSummary } from "../types";

type RpcResponse<T> = { data: T | null; error: string | null };

function parseRpcError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return "Terjadi kesalahan";
}

export async function checkInCandidate(
  supabase: any,
  params: {
    full_name: string;
    email: string;
    phone: string;
    position: string;
    photo_url: string;
    outlet_id: string;
    notes?: string;
  }
): Promise<RpcResponse<Candidate>> {
  const { data, error } = await supabase.rpc("check_in_candidate", {
    p_full_name: params.full_name,
    p_email: params.email,
    p_phone: params.phone,
    p_position: params.position,
    p_photo_url: params.photo_url,
    p_outlet_id: params.outlet_id,
    p_notes: params.notes ?? null,
  }).single();
  return { data, error: error ? parseRpcError(error) : null };
}

export async function transitionCandidateStatus(
  supabase: any,
  candidateId: string,
  newStatus: CandidateStatus,
  note?: string
): Promise<RpcResponse<Candidate>> {
  const { data, error } = await supabase
    .rpc("transition_candidate_status", {
      p_candidate_id: candidateId,
      p_new_status: newStatus,
      p_note: note ?? null,
    })
    .single();
  return { data, error: error ? parseRpcError(error) : null };
}

export async function markNotificationsRead(supabase: any): Promise<void> {
  await supabase.rpc("mark_notifications_read");
}

export async function getAnalyticsSummary(
  supabase: any,
  days?: number
): Promise<RpcResponse<AnalyticsSummary>> {
  const { data, error } = await supabase
    .rpc("analytics_summary", { p_days: days ?? 7 })
    .single();
  return { data, error: error ? parseRpcError(error) : null };
}

export async function adminSetUserRole(
  supabase: any,
  email: string,
  role: string
): Promise<RpcResponse<null>> {
  const { data, error } = await supabase.rpc("admin_set_user_role", {
    p_email: email,
    p_role: role,
  });
  return { data, error: error ? parseRpcError(error) : null };
}
