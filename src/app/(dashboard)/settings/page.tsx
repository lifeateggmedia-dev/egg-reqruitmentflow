import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: outlets } = await supabase.from("outlets").select("*");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pengaturan</h1>
        <p className="text-sm text-zinc-500">Kelola outlet dan role user</p>
      </div>

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

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Role Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">
            Gunakan Supabase SQL Editor:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
              SELECT admin_set_user_role(&apos;email@example.com&apos;, &apos;admin_hr&apos;);
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
