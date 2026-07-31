"use client";

import { useRef, useCallback, useState } from "react";
import { Camera, RefreshCw, X, CameraIcon } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onError: (error: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setLoading(true);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);
      setFacingMode(facing);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError") {
        onError("Izin kamera ditolak. Buka ikon gembok di address bar > izinkan kamera.");
      } else if (e.name === "NotFoundError") {
        onError("Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.");
      } else if (e.name === "NotReadableError") {
        onError("Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi yang memakai kamera.");
      } else if (e.name === "OverconstrainedError") {
        onError("Spesifikasi kamera tidak didukung. Coba ganti kamera atau perangkat.");
      } else {
        onError(`Gagal mengakses kamera (${e.name}). Coba reload halaman atau gunakan perangkat lain.`);
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const flipCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    startCamera(next);
  }, [facingMode, startCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.85));
  }, []);

  const retake = useCallback(() => {
    setCaptured(null);
    if (videoRef.current) videoRef.current.play();
  }, []);

  const confirm = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopStream();
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.8
    );
  }, [onCapture]);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const close = useCallback(() => {
    stopStream();
    setCaptured(null);
  }, [stopStream]);

  if (captured) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100">
        <canvas ref={canvasRef} className="hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={captured} alt="Preview" className="w-full h-64 object-cover" />
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
          <button
            type="button"
            onClick={retake}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-700 shadow backdrop-blur"
          >
            <RefreshCw className="h-4 w-4" />
            Ulang
          </button>
          <button
            type="button"
            onClick={confirm}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow"
          >
            Gunakan Foto
          </button>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => startCamera("environment")}
          disabled={loading}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 transition-colors hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200">
            <Camera className="h-6 w-6 text-zinc-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700">
              {loading ? "Mengakses kamera..." : "Buka Kamera"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Foto wajib menggunakan kamera</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-64 object-cover"
      />
      <button
        type="button"
        onClick={close}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={flipCamera}
        className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
      >
        <CameraIcon className="h-4 w-4" />
      </button>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <button
          type="button"
          onClick={capture}
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur shadow-lg transition-transform active:scale-95"
        >
          <div className="h-10 w-10 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}
