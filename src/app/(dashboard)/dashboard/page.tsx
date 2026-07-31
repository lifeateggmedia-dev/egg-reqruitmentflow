"use client";

import { useState, useMemo } from "react";
import { RealtimeProvider, useCandidates } from "@/providers/realtime-provider";
import { useUser } from "@/providers/auth-provider";
import { CandidateGrid } from "@/components/candidates/candidate-grid";
import { FilterBar } from "@/components/candidates/filter-bar";
import { exportCandidatesCsv } from "@/lib/export";
import { Download } from "lucide-react";
import type { CandidateStatus } from "@/lib/types";

function DashboardContent() {
  const { profile } = useUser();
  const candidates = useCandidates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");

  const filtered = useMemo(() => {
    let result = candidates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.queue_number.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.position.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.current_status === statusFilter);
    }
    return result;
  }, [candidates, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">Realtime — data tersinkronisasi otomatis</p>
        </div>
        <button
          onClick={() => exportCandidatesCsv(filtered)}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <FilterBar
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
      />

      <CandidateGrid candidates={filtered} role={profile!.role} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RealtimeProvider>
      <DashboardContent />
    </RealtimeProvider>
  );
}
