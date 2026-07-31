import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRoleManager } from "@/components/settings/user-role-manager";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: outlets } = await supabase
    .from("outlets")
    .select("*")
    .order("code");

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pengaturan</h1>
        <p className="text-sm text-zinc-500">Kelola outlet dan role user</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Manajemen User ({users?.length ?? 0})</CardTitle>
          <p className="text-xs text-zinc-400">Assign role untuk setiap user yang sudah login</p>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <UserRoleManager users={users as Profile[]} />
          ) : (
            <p className="text-sm text-zinc-400">Belum ada user login</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Outlet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-100">
            {(outlets as { id: string; name: string; code: string }[] | null)?.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{o.name}</p>
                  <p className="text-xs text-zinc-400">Kode: {o.code}</p>
                </div>
              </div>
            )) ?? <p className="text-sm text-zinc-400">Belum ada outlet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
