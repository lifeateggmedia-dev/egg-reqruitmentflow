"use client";

import { useEffect, useSyncExternalStore } from "react";

let now = Date.now();
let listeners: (() => void)[] = [];
let interval: ReturnType<typeof setInterval> | null = null;

function startTicker() {
  if (interval) return;
  interval = setInterval(() => {
    now = Date.now();
    listeners.forEach((l) => l());
  }, 30000);
}

function stopTicker() {
  if (!interval) return;
  clearInterval(interval);
  interval = null;
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  startTicker();
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    if (listeners.length === 0) stopTicker();
  };
}

function getSnapshot() {
  return now;
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot);
}
