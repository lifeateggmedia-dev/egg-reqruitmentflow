"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/auth-provider";
import { StatusBadge } from "@/components/candidates/status-badge";
import { ActionButtons } from "@/components/candidates/action-buttons";
import { ActivityTimeline } from "@/components/timeline/activity-timeline";
import { WaitingTime } from "@/components/candidates/waiting-time";
import { formatDateTime } from "@/lib/utils";
import type { Candidate, ActivityLog } from "@/lib/types";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile } = useUser();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setCandidate(data));

    supabase
      .from("activity_logs")
      .select("*")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setLogs(data ?? []));
  }, [id]);

  if (!candidate || !profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidate.photo_url}
          alt={candidate.full_name}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">{candidate.full_name}</h1>
              <p className="text-sm text-zinc-500">{candidate.position}</p>
            </div>
            <StatusBadge status={candidate.current_status} />
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-mono font-medium text-zinc-600">{candidate.queue_number}</span>
            <WaitingTime arrivalTime={candidate.arrival_time} />
            <span>{candidate.phone}</span>
          </div>
          <div className="mt-3">
            <ActionButtons candidate={candidate} role={profile.role} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Detail Kandidat</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-400">Nama</dt>
            <dd className="text-sm text-zinc-900">{candidate.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Email</dt>
            <dd className="text-sm text-zinc-900">{candidate.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">WhatsApp</dt>
            <dd className="text-sm text-zinc-900">{candidate.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Posisi</dt>
            <dd className="text-sm text-zinc-900">{candidate.position}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Jam Datang</dt>
            <dd className="text-sm text-zinc-900">{formatDateTime(candidate.arrival_time)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Nomor Antrian</dt>
            <dd className="text-sm font-mono text-zinc-900">{candidate.queue_number}</dd>
          </div>
          {candidate.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-zinc-400">Catatan</dt>
              <dd className="text-sm text-zinc-900">{candidate.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900 mb-1">Timeline Aktivitas</h2>
        <ActivityTimeline logs={logs} />
      </div>
    </div>
  );
}
