"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAnalyticsSummary } from "@/lib/supabase/rpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, UserCheck, UserX, Hourglass, CheckCircle2, HelpCircle } from "lucide-react";
import type { AnalyticsSummary, CandidateStatus } from "@/lib/types";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { AnalyticsDetailSheet } from "@/components/analytics/analytics-detail-sheet";

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  statuses: CandidateStatus[];
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [detailSheet, setDetailSheet] = useState<{ label: string; statuses: CandidateStatus[] } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    getAnalyticsSummary(supabase).then(({ data }) => setData(data));
  }, []);

  if (!data) return null;

  const stats: StatItem[] = [
    { label: "Hadir Hari Ini", value: data.total_today, icon: Users, color: "text-zinc-900",
      statuses: ["waiting", "call_session_1", "session_1", "call_session_2", "session_2", "pending", "passed", "failed", "finished"] },
    { label: "Belum Interview", value: data.waiting, icon: Hourglass, color: "text-amber-600",
      statuses: ["waiting"] },
    { label: "Sesi 1", value: data.in_session_1, icon: Users, color: "text-blue-600",
      statuses: ["call_session_1", "session_1"] },
    { label: "Sesi 2", value: data.in_session_2, icon: Users, color: "text-purple-600",
      statuses: ["call_session_2", "session_2"] },
    { label: "Pertimbangan", value: data.pending, icon: HelpCircle, color: "text-amber-500",
      statuses: ["pending"] },
    { label: "Lolos", value: data.passed, icon: UserCheck, color: "text-emerald-600",
      statuses: ["passed"] },
    { label: "Tidak Lolos", value: data.failed, icon: UserX, color: "text-rose-600",
      statuses: ["failed"] },
    { label: "Selesai", value: data.finished, icon: CheckCircle2, color: "text-zinc-400",
      statuses: ["finished"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Analitik</h1>
        <p className="text-sm text-zinc-500">Ringkasan data recruitment hari ini — klik metrik untuk lihat detail</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-2xl cursor-pointer transition-all hover:shadow-md hover:border-zinc-300"
            onClick={() => setDetailSheet({ label: s.label, statuses: s.statuses })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rata-rata Waktu Tunggu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-zinc-900">
            {data.avg_wait_minutes} <span className="text-lg font-normal text-zinc-400">menit</span>
          </p>
        </CardContent>
      </Card>

      <AnalyticsDetailSheet
        open={!!detailSheet}
        onOpenChange={(open) => !open && setDetailSheet(null)}
        label={detailSheet?.label ?? ""}
        statuses={detailSheet?.statuses ?? []}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RealtimeProvider>
      <AnalyticsContent />
    </RealtimeProvider>
  );
}
