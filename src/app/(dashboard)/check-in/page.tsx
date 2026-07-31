import { CheckInForm } from "@/components/check-in/check-in-form";
import { createClient } from "@/lib/supabase/server";
import type { Outlet } from "@/lib/types";

export default async function CheckInPage() {
  const supabase = await createClient();
  const { data: outlets } = await supabase.from("outlets").select("*");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Check In Kandidat</h1>
        <p className="text-sm text-zinc-500">Foto wajib menggunakan kamera. Tidak bisa upload dari gallery.</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <CheckInForm outlets={(outlets as Outlet[]) ?? []} />
      </div>
    </div>
  );
}
