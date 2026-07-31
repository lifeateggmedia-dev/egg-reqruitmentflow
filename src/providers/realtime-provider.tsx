"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Candidate, AppNotification } from "@/lib/types";

interface Store {
  candidates: Map<string, Candidate>;
  notifications: AppNotification[];
  connected: boolean;
}

type Action =
  | { type: "INIT_CANDIDATES"; candidates: Candidate[] }
  | { type: "UPSERT_CANDIDATE"; candidate: Candidate }
  | { type: "REMOVE_CANDIDATE"; id: string }
  | { type: "ADD_NOTIFICATION"; notification: AppNotification }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "SET_CONNECTED"; connected: boolean };

function reducer(state: Store, action: Action): Store {
  switch (action.type) {
    case "INIT_CANDIDATES": {
      const map = new Map(state.candidates);
      for (const c of action.candidates) map.set(c.id, c);
      return { ...state, candidates: map };
    }
    case "UPSERT_CANDIDATE": {
      const map = new Map(state.candidates);
      const existing = map.get(action.candidate.id);
      if (
        existing &&
        new Date(existing.updated_at) >= new Date(action.candidate.updated_at)
      ) {
        return state; // stale overwrite guard
      }
      map.set(action.candidate.id, action.candidate);
      return { ...state, candidates: map };
    }
    case "REMOVE_CANDIDATE": {
      const map = new Map(state.candidates);
      map.delete(action.id);
      return { ...state, candidates: map };
    }
    case "ADD_NOTIFICATION": {
      if (state.notifications.some((n) => n.id === action.notification.id)) {
        return state; // dedup
      }
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };
    }
    case "MARK_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "SET_CONNECTED":
      return { ...state, connected: action.connected };
    default:
      return state;
  }
}

const initialState: Store = {
  candidates: new Map(),
  notifications: [],
  connected: true,
};

const RealtimeContext = createContext<Store>(initialState);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    supabase
      .from("candidates")
      .select("*")
      .order("arrival_time", { ascending: false })
      .then(({ data }) => {
        if (data) dispatch({ type: "INIT_CANDIDATES", candidates: data });
      });

    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          for (const n of data) {
            dispatch({ type: "ADD_NOTIFICATION", notification: n });
          }
        }
      });

    const channel = supabase.channel("egg-realtime");

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "candidates" },
        (payload) => {
          dispatch({
            type: "UPSERT_CANDIDATE",
            candidate: payload.new as Candidate,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "candidates" },
        (payload) => {
          dispatch({
            type: "UPSERT_CANDIDATE",
            candidate: payload.new as Candidate,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "candidates" },
        (payload) => {
          dispatch({ type: "REMOVE_CANDIDATE", id: payload.old.id });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          dispatch({
            type: "ADD_NOTIFICATION",
            notification: payload.new as AppNotification,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          dispatch({
            type: "ADD_NOTIFICATION",
            notification: payload.new as AppNotification,
          });
        }
      )
      .subscribe((status) => {
        dispatch({
          type: "SET_CONNECTED",
          connected: status === "SUBSCRIBED",
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={store}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function useCandidates(filter?: (c: Candidate) => boolean): Candidate[] {
  const { candidates } = useContext(RealtimeContext);
  const all = Array.from(candidates.values());
  if (!filter) return all;
  return all.filter(filter);
}

export function useCandidate(id: string): Candidate | undefined {
  const { candidates } = useContext(RealtimeContext);
  return candidates.get(id);
}

export function useNotifications(): AppNotification[] {
  const { notifications } = useContext(RealtimeContext);
  return notifications;
}

export function useUnreadCount(): number {
  const { notifications } = useContext(RealtimeContext);
  return notifications.filter((n) => !n.read).length;
}
