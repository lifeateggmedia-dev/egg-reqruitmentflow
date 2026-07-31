"use client";

import { RealtimeProvider, useCandidates } from "@/providers/realtime-provider";
import { useUser } from "@/providers/auth-provider";
import { CandidateGrid } from "@/components/candidates/candidate-grid";

function Session2Content() {
  const { profile } = useUser();
  const candidates = useCandidates((c) =>
    ["call_session_2", "session_2", "pending"].includes(c.current_status)
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Sesi 2 — Keputusan</h1>
        <p className="text-sm text-zinc-500">
          Kandidat yang sudah masuk Sesi 2. Tentukan Lolos atau Tidak Lolos.
        </p>
      </div>
      <CandidateGrid
        candidates={candidates}
        role={profile!.role}
        emptyMessage="Tidak ada kandidat di Sesi 2"
      />
    </div>
  );
}

export default function Session2Page() {
  return (
    <RealtimeProvider>
      <Session2Content />
    </RealtimeProvider>
  );
}
