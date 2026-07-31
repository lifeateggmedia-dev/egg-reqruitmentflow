"use client";

import { useState, useCallback } from "react";
import { CameraCapture } from "./camera-capture";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PhotoUploadProps {
  onUploaded: (photoUrl: string) => void;
}

export function PhotoUpload({ onUploaded }: PhotoUploadProps) {
  const [state, setState] = useState<"idle" | "capturing" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleCapture = useCallback(
    async (blob: Blob) => {
      setState("uploading");
      setErrorMsg(null);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(blob);

      try {
        const presignRes = await fetch("/api/photos/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!presignRes.ok) {
          throw new Error("Gagal mendapatkan izin upload");
        }

        const { uploadUrl, objectUrl } = await presignRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": "image/jpeg" },
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengupload foto");
        }

        onUploaded(objectUrl);
        setState("done");
      } catch (err) {
        setState("error");
        setErrorMsg(err instanceof Error ? err.message : "Gagal upload foto");
      }
    },
    [onUploaded]
  );

  if (state === "done" && preview) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Foto" className="h-12 w-12 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">Foto berhasil diambil</span>
          </div>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        <span className="text-sm text-zinc-600">Mengupload foto...</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span className="text-sm text-rose-600">{errorMsg}</span>
        </div>
        <button
          type="button"
          onClick={() => { setState("idle"); setErrorMsg(null); }}
          className="text-sm font-medium text-zinc-600 underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return <CameraCapture onCapture={handleCapture} onError={(msg) => { setState("error"); setErrorMsg(msg); }} />;
}
