"use client";

import { useEffect, useState } from "react";
import { computeDashboard, loadHistory, loadStats, type DashboardStats, type StatsRecord } from "@/lib/stats";

interface Props {
  onClose: () => void;
}

const EMPTY_DASH: DashboardStats = {
  totalDebates: 0,
  favoriteSport: null,
  favoriteAthlete: null,
  avgWords: 0,
  longestWinStreak: 0,
  friendDebates: 0,
  aiDebates: 0,
};

export default function Dashboard({ onClose }: Props) {
  const [dash, setDash] = useState<DashboardStats>(EMPTY_DASH);
  const [stats, setStats] = useState<StatsRecord>({ wins: 0, losses: 0, streak: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDash(computeDashboard(loadHistory()));
    setStats(loadStats());
  }, []);

  const winRate = dash.totalDebates > 0 ? Math.round((stats.wins / dash.totalDebates) * 100) : 0;

  const rows: { label: string; value: string }[] = [
    { label: "Debates played", value: String(dash.totalDebates) },
    { label: "Win rate", value: `${winRate}%` },
    { label: "Longest win streak", value: String(dash.longestWinStreak) },
    { label: "Favorite sport", value: dash.favoriteSport ?? "—" },
    { label: "Favorite pick", value: dash.favoriteAthlete ?? "—" },
    { label: "Avg. words per argument", value: dash.avgWords > 0 ? String(dash.avgWords) : "—" },
    { label: "Vs AI / vs friend", value: `${dash.aiDebates} / ${dash.friendDebates}` },
  ];

  return (
    <div
      className="fixed inset-0 z-20 flex items-start justify-center bg-page/60 p-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="card-shadow animate-rise w-full max-w-md rounded-xl border border-edge bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text">Your dashboard</h2>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text transition-colors cursor-pointer"
            aria-label="Close dashboard"
          >
            ✕
          </button>
        </div>
        {dash.totalDebates === 0 ? (
          <p className="mt-4 text-sm text-text-dim">Finish a debate to start building your stats.</p>
        ) : (
          <dl className="mt-4 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between border-b border-edge/60 py-1.5 text-sm">
                <dt className="text-text-dim">{r.label}</dt>
                <dd className="font-semibold text-text">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
