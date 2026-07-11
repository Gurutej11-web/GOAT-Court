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
  userWords: number;
}

export interface DashboardStats {
  totalDebates: number;
  favoriteSport: string | null;
  favoriteAthlete: string | null;
  avgWords: number;
  longestWinStreak: number;
  friendDebates: number;
  aiDebates: number;
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

function mostFrequent(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [v, count] of counts) {
    if (count > bestCount) {
      best = v;
      bestCount = count;
    }
  }
  return best;
}

/** All derived dashboard metrics, computed straight from the history log. */
export function computeDashboard(history: HistoryEntry[]): DashboardStats {
  if (history.length === 0) {
    return {
      totalDebates: 0,
      favoriteSport: null,
      favoriteAthlete: null,
      avgWords: 0,
      longestWinStreak: 0,
      friendDebates: 0,
      aiDebates: 0,
    };
  }
  const chronological = [...history].sort((a, b) => a.timestamp - b.timestamp);
  let longest = 0;
  let running = 0;
  for (const entry of chronological) {
    if (entry.winner === "user") {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }
  const totalWords = history.reduce((sum, e) => sum + (e.userWords || 0), 0);
  return {
    totalDebates: history.length,
    favoriteSport: mostFrequent(history.map((e) => e.sport)),
    favoriteAthlete: mostFrequent(history.map((e) => e.userAthlete)),
    avgWords: Math.round(totalWords / history.length),
    longestWinStreak: longest,
    friendDebates: history.filter((e) => e.mode === "friend").length,
    aiDebates: history.filter((e) => e.mode === "ai").length,
  };
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
