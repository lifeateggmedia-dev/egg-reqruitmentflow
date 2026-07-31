import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy", { locale: id });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy HH:mm", { locale: id });
}

export function waitingMinutes(arrivalTime: string): number {
  const diff = Date.now() - new Date(arrivalTime).getTime();
  return Math.floor(diff / 60000);
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: id });
}
