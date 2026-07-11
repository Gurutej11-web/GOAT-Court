"use client";

import type { DebateMode, Side } from "./types";

export interface StatsRecord {
  wins: number;
  losses: number;
  streak: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  sport: string;
  userAthlete: string;
  aiAthlete: string;
  winner: Side;
  userTotal: number;
  aiTotal: number;
  mode: DebateMode;
}

const STATS_KEY = "goat-court-stats-v1";
const HISTORY_KEY = "goat-court-history-v1";
const ONBOARDED_KEY = "goat-court-onboarded-v1";
const MAX_HISTORY = 20;

const EMPTY_STATS: StatsRecord = { wins: 0, losses: 0, streak: 0 };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStats(): StatsRecord {
  if (typeof window === "undefined") return EMPTY_STATS;
  return safeParse(window.localStorage.getItem(STATS_KEY), EMPTY_STATS);
}

export function recordResult(won: boolean): StatsRecord {
  const current = loadStats();
  const next: StatsRecord = won
    ? { wins: current.wins + 1, losses: current.losses, streak: current.streak >= 0 ? current.streak + 1 : 1 }
    : { wins: current.wins, losses: current.losses + 1, streak: current.streak <= 0 ? current.streak - 1 : -1 };
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable, nothing to do
  }
  return next;
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(HISTORY_KEY), [] as HistoryEntry[]);
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry[] {
  const list = loadHistory();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const withNew = [{ ...entry, id, timestamp: Date.now() }, ...list].slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(withNew));
  } catch {
    // storage unavailable, nothing to do
  }
  return withNew;
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboarded() {
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    // storage unavailable, nothing to do
  }
}
