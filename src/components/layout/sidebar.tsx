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

function NavItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = ICONS[icon];
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const navItems = ROLE_NAV[role];

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} onClick={onNavigate} />
      ))}
    </nav>
  );
}

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-zinc-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
          E
        </div>
        <span className="font-semibold text-sm text-zinc-900">EGG Recruitment</span>
      </div>
      <div className="flex-1 p-3">
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}
