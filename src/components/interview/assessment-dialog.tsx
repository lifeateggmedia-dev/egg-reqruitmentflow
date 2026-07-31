"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
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

const SESSION_1_TEMPLATES = [
  "Ceritakan tentang pengalaman kerja Anda sebelumnya.",
  "Apa kekuatan dan kelemahan utama Anda?",
  "Mengapa Anda tertarik dengan posisi ini?",
  "Bagaimana Anda menangani konflik dengan rekan kerja?",
  "Apa pencapaian terbesar Anda?",
  "Bagaimana cara Anda belajar hal baru?",
  "Bagaimana Anda bekerja di bawah tekanan?",
  "Apa target karir Anda 5 tahun ke depan?",
];

const SESSION_2_TEMPLATES = [
  "Bagaimana penilaian Anda terhadap candidate ini secara keseluruhan?",
  "Apa nilai plus yang membedakan candidate ini dari yang lain?",
  "Apa kekhawatiran atau catatan khusus tentang candidate ini?",
  "Apakah candidate cocok dengan budaya perusahaan?",
  "Bagaimana potensi kontribusi candidate untuk tim?",
  "Apakah ada skill gap yang perlu dipertimbangkan?",
];

interface QuestionAnswer {
  id: number;
  question: string;
  answer: string;
  isCustom: boolean;
}

interface AssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  targetStatus: CandidateStatus;
  session: "session_1" | "session_2";
  onSubmit: (note: string, decision: CandidateStatus) => void;
  loading: boolean;
}

export function AssessmentDialog({
  open,
  onOpenChange,
  candidate,
  targetStatus,
  session,
  onSubmit,
  loading,
}: AssessmentDialogProps) {
  const templates = session === "session_1" ? SESSION_1_TEMPLATES : SESSION_2_TEMPLATES;
  const [qas, setQas] = useState<QuestionAnswer[]>(() =>
    templates.map((q, i) => ({ id: i, question: q, answer: "", isCustom: false }))
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<CandidateStatus | null>(null);

  const updateAnswer = (id: number, answer: string) => {
    setQas((prev) => prev.map((qa) => (qa.id === id ? { ...qa, answer } : qa)));
  };

  const addCustomQA = () => {
    const q = customQuestion.trim();
    if (!q) return;
    const newId = Math.max(...qas.map((x) => x.id), 0) + 1;
    setQas((prev) => [...prev, { id: newId, question: q, answer: "", isCustom: true }]);
    setCustomQuestion("");
  };

  const removeQA = (id: number) => {
    setQas((prev) => prev.filter((qa) => qa.id !== id));
  };

  const answeredCount = useMemo(() => qas.filter((qa) => qa.answer.trim()).length, [qas]);

  const buildNote = (): string => {
    const answered = qas.filter((qa) => qa.answer.trim());
    if (answered.length === 0 && !notes.trim()) return "";

    const parts: string[] = [];
    if (answered.length > 0) {
      parts.push(
        "Tanya Jawab:\n" +
          answered.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")
      );
    }
    if (notes.trim()) {
      parts.push("Catatan:\n" + notes.trim());
    }
    return parts.join("\n\n---\n\n");
  };

  const handleSubmit = (statusOverride?: CandidateStatus) => {
    const finalStatus = statusOverride ?? targetStatus;
    setDecision(finalStatus);
    const combined = buildNote();
    onSubmit(combined, finalStatus);
  };

  const targetLabel = STATUS_META[targetStatus]?.label ?? targetStatus;
  const isSession2Decision = session === "session_2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {session === "session_1" ? "Penilaian Sesi 1" : "Keputusan Sesi 2"} — {candidate.full_name}
          </DialogTitle>
          <p className="text-xs text-zinc-400">
            {candidate.queue_number} · {answeredCount}/{qas.length} pertanyaan terjawab
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Q&A List */}
          <div className="space-y-4">
            {qas.map((qa) => (
              <div key={qa.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-xs font-medium text-zinc-600 leading-snug flex-1">
                    {qa.question}
                  </Label>
                  {qa.isCustom && (
                    <button
                      type="button"
                      onClick={() => removeQA(qa.id)}
                      className="mt-0.5 shrink-0 text-zinc-300 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <Textarea
                  value={qa.answer}
                  onChange={(e) => updateAnswer(qa.id, e.target.value)}
                  placeholder="Tulis jawaban..."
                  className="rounded-xl text-sm"
                  rows={3}
                />
              </div>
            ))}
          </div>

          {/* Custom Question */}
          <div className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <Label className="text-xs font-medium text-zinc-500">Tambah pertanyaan custom</Label>
            <div className="flex gap-2">
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Tulis pertanyaan..."
                className="rounded-xl h-8 text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomQA())}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={addCustomQA}
                disabled={!customQuestion.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Catatan tambahan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan umum..."
              className="rounded-xl text-sm"
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        {isSession2Decision ? (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit("failed")}
              disabled={loading}
              className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              {loading && decision === "failed" ? "..." : "Tidak Lolos"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit("pending")}
              disabled={loading}
              className="flex-1 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            >
              {loading && decision === "pending" ? "..." : "Pertimbangan"}
            </Button>
            <Button
              onClick={() => handleSubmit("passed")}
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading && decision === "passed" ? "..." : "Lolos"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex-1 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {loading ? "..." : `Kirim ke Session 2`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
