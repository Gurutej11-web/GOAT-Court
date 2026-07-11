"use client";

import { useEffect, useState } from "react";

interface Props {
  sport: string;
  a: string;
  b: string;
}

interface Odds {
  aPct: number;
  bPct: number;
  blurb: string;
}

export default function OddsPreview({ sport, a, b }: Props) {
  const [odds, setOdds] = useState<Odds | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOdds(null);
    setLoading(true);
    fetch("/api/odds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport, a, b }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.odds) setOdds(data.odds);
      })
      .catch(() => {
        // odds are a nice-to-have; fail quietly
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sport, a, b]);

  if (loading) {
    return <p className="mt-2 text-xs text-text-dim/70 animate-pulse-soft">Reading the room…</p>;
  }
  if (!odds) return null;

  return (
    <div className="card-shadow mt-3 rounded-lg border border-edge bg-surface p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Pre-debate odds</p>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-page">
        <div className="bg-accent" style={{ width: `${odds.aPct}%` }} />
        <div className="bg-neutral" style={{ width: `${odds.bPct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-text-dim">
        <span>
          {a} {odds.aPct}%
        </span>
        <span>
          {b} {odds.bPct}%
        </span>
      </div>
      <p className="mt-2 text-xs text-text-dim/80">{odds.blurb}</p>
    </div>
  );
}
