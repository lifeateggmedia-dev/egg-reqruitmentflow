import type { CandidateStatus, UserRole, NotificationPriority } from "./types";

export const STATUS_META: Record<
  CandidateStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }
> = {
  waiting: { label: "Menunggu", variant: "secondary", color: "text-zinc-500" },
  call_session_1: { label: "Dipanggil Sesi 1", variant: "outline", color: "text-blue-600" },
  session_1: { label: "Sesi 1", variant: "outline", color: "text-blue-700" },
  call_session_2: { label: "Dipanggil Sesi 2", variant: "outline", color: "text-purple-600" },
  session_2: { label: "Sesi 2", variant: "outline", color: "text-purple-700" },
  passed: { label: "Lolos", variant: "default", color: "text-emerald-600" },
  failed: { label: "Tidak Lolos", variant: "destructive", color: "text-rose-600" },
  finished: { label: "Selesai", variant: "secondary", color: "text-zinc-400" },
};

export const STATUS_ORDER: CandidateStatus[] = [
  "waiting",
  "call_session_1",
  "session_1",
  "call_session_2",
  "session_2",
  "passed",
  "failed",
  "finished",
];

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: "border-l-zinc-400",
  medium: "border-l-amber-500",
  high: "border-l-rose-500",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  frontliner: "Frontliner",
  interviewer_1: "Interviewer Sesi 1",
  owner: "Owner Sesi 2",
  admin_hr: "Admin HR",
};

export const ROLE_NAV: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  frontliner: [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/check-in", label: "Check In", icon: "UserPlus" },
  ],
  interviewer_1: [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/interview/session-1", label: "Sesi 1", icon: "Users" },
  ],
  owner: [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/interview/session-2", label: "Sesi 2", icon: "UserCheck" },
    { href: "/analytics", label: "Analitik", icon: "BarChart3" },
  ],
  admin_hr: [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/check-in", label: "Check In", icon: "UserPlus" },
    { href: "/analytics", label: "Analitik", icon: "BarChart3" },
    { href: "/settings", label: "Pengaturan", icon: "Settings" },
  ],
};

export const WAITING_TIME_WARN = 15; // minutes — amber
export const WAITING_TIME_DANGER = 30; // minutes — red
