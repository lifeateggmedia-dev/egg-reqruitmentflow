import type { Candidate, ActivityLog } from "./types";
import { formatDateTime, formatTime } from "./utils";
import { STATUS_META } from "./constants";

const BOM = "﻿";

export function buildCsv<T>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map((c) => escapeCsv(c.header)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCsv(String((row as Record<string, unknown>)[c.key as string] ?? "")))
      .join(",")
  );
  return `${BOM}${header}\n${lines.join("\n")}`;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCandidatesCsv(candidates: Candidate[]): void {
  const csv = buildCsv(candidates, [
    { key: "queue_number", header: "No Antrian" },
    { key: "full_name", header: "Nama" },
    { key: "email", header: "Email" },
    { key: "phone", header: "WhatsApp" },
    { key: "position", header: "Posisi" },
    { key: "current_status", header: "Status" },
    { key: "arrival_time", header: "Jam Datang" },
  ]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `kandidat-${today}.csv`);
}

export function exportActivityCsv(logs: ActivityLog[], candidateName: string): void {
  const csv = buildCsv(logs, [
    { key: "action", header: "Aksi" },
    { key: "old_status", header: "Status Lama" },
    { key: "new_status", header: "Status Baru" },
    { key: "created_at", header: "Waktu" },
  ]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `timeline-${candidateName}.csv`);
}

export function printView(): void {
  window.print();
}
