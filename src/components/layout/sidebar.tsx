"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  UserCheck,
  BarChart3,
  Settings,
} from "lucide-react";
import { ROLE_NAV } from "@/lib/constants";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UserPlus,
  Users,
  UserCheck,
  BarChart3,
  Settings,
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = ROLE_NAV[role];

  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-zinc-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
          E
        </div>
        <span className="font-semibold text-sm text-zinc-900">EGG Recruitment</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
