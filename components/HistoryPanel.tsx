"use client";

import { useEffect, useState } from "react";
import { loadHistory, type HistoryEntry } from "@/lib/stats";

interface Props {
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HistoryPanel({ onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

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
          <h2 className="font-display text-lg font-bold text-text">Past debates</h2>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text transition-colors cursor-pointer"
            aria-label="Close history"
          >
            ✕
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-text-dim">No debates finished yet. Go argue with someone.</p>
        ) : (
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {entries.map((e) => {
              const userWon = e.winner === "user";
              return (
                <li
                  key={e.id}
                  className="rounded-lg border border-edge bg-page/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-text">
                      {e.userAthlete} <span className="text-text-dim">vs</span> {e.aiAthlete}
                    </p>
                    <span className="shrink-0 text-xs text-text-dim">{formatDate(e.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-dim">
                    {e.sport} · {e.mode === "friend" ? "vs friend" : "vs AI"} ·{" "}
                    <span className={userWon ? "text-accent" : "text-neutral"}>
                      {userWon ? "You won" : "You lost"}
                    </span>{" "}
                    {e.userTotal}-{e.aiTotal}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
