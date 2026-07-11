"use client";

import { useEffect, useState } from "react";
import { clearHistory, deleteHistoryEntry, loadHistory, type HistoryEntry } from "@/lib/stats";

interface Props {
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HistoryPanel({ onClose }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

  function removeOne(id: string) {
    setEntries(deleteHistoryEntry(id));
  }

  function removeAll() {
    clearHistory();
    setEntries([]);
    setConfirmingClear(false);
  }

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
          <>
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
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-text-dim">{formatDate(e.timestamp)}</span>
                        <button
                          onClick={() => removeOne(e.id)}
                          aria-label={`Delete debate: ${e.userAthlete} vs ${e.aiAthlete}`}
                          className="text-text-dim transition-colors hover:text-neutral cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
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
            <div className="mt-4 flex justify-end">
              {confirmingClear ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-dim">Delete all history?</span>
                  <button
                    onClick={removeAll}
                    className="rounded-lg border border-neutral px-2.5 py-1 text-neutral transition-colors hover:bg-neutral/10 cursor-pointer"
                  >
                    Yes, delete all
                  </button>
                  <button
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-lg border border-edge px-2.5 py-1 text-text-dim transition-colors hover:text-text cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingClear(true)}
                  className="text-xs text-text-dim transition-colors hover:text-neutral cursor-pointer"
                >
                  Clear all history
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
