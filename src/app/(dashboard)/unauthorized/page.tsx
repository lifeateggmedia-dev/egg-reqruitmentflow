import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
        <ShieldX className="h-8 w-8 text-rose-500" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-zinc-900">Akses Ditolak</h2>
        <p className="text-sm text-zinc-500">
          Role Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-zinc-900 underline underline-offset-4"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
