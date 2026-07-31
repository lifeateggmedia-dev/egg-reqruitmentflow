"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type CameraErrorType = "NotAllowedError" | "NotFoundError" | "NotReadableError" | "unknown";

export interface CameraState {
  stream: MediaStream | null;
  error: CameraErrorType | null;
  loading: boolean;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    loading: false,
  });
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState({ stream: null, error: null, loading: false });
  }, []);

  const startCamera = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setState({ stream, error: null, loading: false });
    } catch (err) {
      const e = err as DOMException;
      const error: CameraErrorType =
        e.name === "NotAllowedError"
          ? "NotAllowedError"
          : e.name === "NotFoundError"
            ? "NotFoundError"
            : e.name === "NotReadableError"
              ? "NotReadableError"
              : "unknown";
      setState({ stream: null, error, loading: false });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { ...state, startCamera, stopCamera };
}
