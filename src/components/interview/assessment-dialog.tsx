"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Candidate, CandidateStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";

const DEFAULT_TEMPLATES = [
  "Ceritakan tentang pengalaman kerja Anda sebelumnya.",
  "Apa kekuatan dan kelemahan utama Anda?",
  "Mengapa Anda tertarik dengan posisi ini?",
  "Bagaimana Anda menangani konflik dengan rekan kerja?",
  "Di mana Anda melihat diri Anda dalam 5 tahun ke depan?",
  "Bagaimana Anda bekerja di bawah tekanan?",
  "Apa pencapaian terbesar Anda?",
  "Bagaimana cara Anda belajar hal baru?",
  "Ceritakan situasi sulit yang pernah Anda hadapi dan bagaimana mengatasinya.",
  "Apa ekspektasi gaji Anda?",
];

interface AssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  targetStatus: CandidateStatus;
  onSubmit: (note: string) => void;
  loading: boolean;
}

export function AssessmentDialog({
  open,
  onOpenChange,
  candidate,
  targetStatus,
  onSubmit,
  loading,
}: AssessmentDialogProps) {
  const [notes, setNotes] = useState("");
  const [templates, setTemplates] = useState<string[]>(DEFAULT_TEMPLATES);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [customQuestion, setCustomQuestion] = useState("");
  const [assessmentNotes, setAssessmentNotes] = useState("");

  const toggleQuestion = (idx: number) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const addCustomQuestion = () => {
    const q = customQuestion.trim();
    if (!q) return;
    setTemplates((prev) => [...prev, q]);
    setCustomQuestion("");
  };

  const handleSubmit = () => {
    const parts: string[] = [];

    if (selectedQuestions.size > 0) {
      const selected = Array.from(selectedQuestions)
        .sort()
        .map((i) => `- ${templates[i]}`);
      parts.push("Pertanyaan:\n" + selected.join("\n"));
    }

    if (assessmentNotes.trim()) {
      parts.push("Catatan penilaian:\n" + assessmentNotes.trim());
    }

    if (notes.trim()) {
      parts.push("Catatan:\n" + notes.trim());
    }

    const combined = parts.join("\n\n");
    onSubmit(combined);
    setNotes("");
    setSelectedQuestions(new Set());
    setAssessmentNotes("");
  };

  const targetLabel = STATUS_META[targetStatus]?.label ?? targetStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Penilaian — {candidate.full_name}
          </DialogTitle>
          <p className="text-xs text-zinc-400">
            {candidate.queue_number} → {targetLabel}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Question Templates */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500">Pilih pertanyaan yang diajukan</Label>
            <div className="max-h-36 space-y-1 overflow-y-auto">
              {templates.map((q, i) => (
                <label
                  key={i}
                  className="flex items-start gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(i)}
                    onChange={() => toggleQuestion(i)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-300 accent-zinc-900"
                  />
                  <span className="text-xs text-zinc-600 leading-relaxed">{q}</span>
                </label>
              ))}
            </div>

            {/* Custom question input */}
            <div className="flex gap-2">
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Tambah pertanyaan sendiri..."
                className="rounded-xl h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomQuestion())}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={addCustomQuestion}
                disabled={!customQuestion.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Assessment Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500">Catatan penilaian</Label>
            <Textarea
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="Tulis hasil penilaian interview..."
              className="rounded-xl text-sm"
              rows={3}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500">Catatan tambahan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan lain..."
              className="rounded-xl text-sm"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
          >
            {loading ? "..." : `Konfirmasi — ${targetLabel}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
