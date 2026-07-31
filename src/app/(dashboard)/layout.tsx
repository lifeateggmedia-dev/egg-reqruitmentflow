import { requireRole } from "@/lib/auth/current-user";
import { AuthProvider } from "@/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import type { UserRole } from "@/lib/types";

const ROLE_ACCESS: Record<string, UserRole[]> = {
  "/dashboard": ["frontliner", "interviewer_1", "owner", "admin_hr"],
  "/check-in": ["frontliner", "admin_hr"],
  "/interview/session-1": ["interviewer_1", "admin_hr"],
  "/interview/session-2": ["owner", "admin_hr"],
  "/analytics": ["owner", "admin_hr"],
  "/settings": ["admin_hr"],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
