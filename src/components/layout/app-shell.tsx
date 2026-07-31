"use client";

import { type ReactNode } from "react";
import { useUser } from "@/providers/auth-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
