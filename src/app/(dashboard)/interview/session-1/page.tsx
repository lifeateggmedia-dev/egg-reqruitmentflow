"use client";

import { useMemo } from "react";
import { RealtimeProvider, useCandidates } from "@/providers/realtime-provider";
import { useUser } from "@/providers/auth-provider";
import { CandidateGrid } from "@/components/candidates/candidate-grid";

function Session1Content() {
  const { profile } = useUser();
  const candidates = useCandidates((c) =>
    ["waiting", "call_session_1", "session_1"].includes(c.current_status)
  );

  const sorted = useMemo(
    () =>
      [...candidates].sort((a, b) => {
        const order = ["session_1", "call_session_1", "waiting"];
        return order.indexOf(a.current_status) - order.indexOf(b.current_status);
      }),
    [candidates]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Sesi 1 — Interview</h1>
        <p className="text-sm text-zinc-500">
          Klik &quot;Panggil Kandidat&quot; untuk memanggil. Klik &quot;Kirim ke Session 2&quot; setelah selesai.
        </p>
      </div>
      <CandidateGrid
        candidates={sorted}
        role={profile!.role}
        emptyMessage="Tidak ada kandidat yang menunggu Sesi 1"
      />
    </div>
  );
}

export default function Session1Page() {
  return (
    <RealtimeProvider>
      <Session1Content />
    </RealtimeProvider>
  );
}
