"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import type { UserRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ROLES: UserRole[] = ["frontliner", "interviewer_1", "owner", "admin_hr"];

export function UserRoleManager({ users: initialUsers }: { users: Profile[] }) {
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = async (email: string, newRole: UserRole) => {
    const prev = [...users];
    setUsers((u) => u.map((x) => (x.email === email ? { ...x, role: newRole } : x)));

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_user_role", {
      p_email: email,
      p_role: newRole,
    });

    if (error) {
      setUsers(prev);
      toast.error("Gagal mengubah role: " + (error as { message?: string }).message);
    } else {
      toast.success(`Role untuk ${email} diubah menjadi ${ROLE_LABELS[newRole]}`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="py-3 text-left text-xs font-medium text-zinc-400">Nama</th>
            <th className="py-3 text-left text-xs font-medium text-zinc-400">Email</th>
            <th className="py-3 text-left text-xs font-medium text-zinc-400">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-900">{user.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="text-sm text-zinc-500">{user.email}</span>
              </td>
              <td className="py-3">
                <Select
                  value={user.role}
                  onValueChange={(value) =>
                    handleRoleChange(user.email, value as UserRole)
                  }
                >
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
