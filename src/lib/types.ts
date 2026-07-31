export type UserRole = "frontliner" | "interviewer_1" | "owner" | "admin_hr";

export type CandidateStatus =
  | "waiting"
  | "call_session_1"
  | "session_1"
  | "call_session_2"
  | "session_2"
  | "pending"
  | "passed"
  | "failed"
  | "finished";

export type NotificationType =
  | "check_in"
  | "call_session_1"
  | "send_session_2"
  | "decision"
  | "directed"
  | "system";

export type NotificationPriority = "low" | "medium" | "high";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  queue_number: string;
  full_name: string;
  email: string | null;
  phone: string;
  position: string;
  photo_url: string;
  arrival_time: string;
  current_status: CandidateStatus;
  notes: string | null;
  outlet_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  candidate_id: string;
  user_id: string | null;
  action: string;
  old_status: CandidateStatus | null;
  new_status: CandidateStatus | null;
  note: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  candidate_id: string | null;
  target_role: UserRole;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: UserRole;
  permissions: Record<string, boolean>;
}

export interface AnalyticsSummary {
  total_today: number;
  waiting: number;
  in_session_1: number;
  in_session_2: number;
  passed: number;
  failed: number;
  avg_wait_minutes: number;
  avg_interview_minutes: number;
  daily_counts: { date: string; count: number }[];
}

export interface PresignedUpload {
  uploadUrl: string;
  objectUrl: string;
}
