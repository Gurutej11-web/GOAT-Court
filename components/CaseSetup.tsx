"use client";

import { useState } from "react";
import { FEATURED, SPORTS, athletesFor, randomMatchup } from "@/lib/matchups";
import type { CaseConfig } from "@/lib/types";

interface Props {
  live: boolean;
  onStart: (c: CaseConfig) => void;
}

export default function CaseSetup({ live, onStart }: Props) {
  const [sport, setSport] = useState("");
  const [athleteA, setAthleteA] = useState("");
  const [athleteB, setAthleteB] = useState("");
  const [side, setSide] = useState<"a" | "b" | null>(null);

  const ready = Boolean(sport && athleteA && athleteB);
  const roster = athletesFor(sport);

  function pickMatchup(newSport: string, a: string, b: string) {
    setSport(newSport);
    setAthleteA(a);
    setAthleteB(b);
    setSide(null);
  }

  function surpriseMe() {
    const r = randomMatchup();
    pickMatchup(r.sport, r.a, r.b);
  }

  function changeSport(newSport: string) {
    setSport(newSport);
    setAthleteA("");
    setAthleteB("");
    setSide(null);
  }

  function start() {
    if (!ready || !side) return;
    const [user, ai] = side === "a" ? [athleteA, athleteB] : [athleteB, athleteA];
    onStart({ sport, userAthlete: user, aiAthlete: ai });
  }

  const selectClass =
    "w-full rounded-xl border border-edge bg-surface px-3 py-2.5 text-text focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/40 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-16">
      {/* Masthead */}
      <header className="text-center animate-rise">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan uppercase">
          Pick two legends
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text sm:text-7xl">
          <span className="bg-gradient-to-r from-violet-bright to-cyan bg-clip-text text-transparent">
            GOAT
          </span>{" "}
          Court
        </h1>
        <p className="mt-4 text-lg text-text-dim">
          Argue your pick is the greatest of all time against an AI that argues
          right back — with real stats. Then let an AI judge settle it.
        </p>
        {!live && (
          <span className="mt-4 inline-block rounded-full border border-cyan/50 bg-cyan-deep/20 px-3 py-1 font-mono text-[11px] tracking-widest text-text uppercase">
            Demo mode — no API key yet
          </span>
        )}
      </header>

      {/* Featured picks */}
      <section className="mt-10 animate-rise" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-mono text-xs tracking-[0.2em] text-text-dim uppercase">
          Popular matchups
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURED.map((r) => {
            const active = sport === r.sport && athleteA === r.a && athleteB === r.b;
            return (
              <button
                key={`${r.a}-${r.b}`}
                onClick={() => pickMatchup(r.sport, r.a, r.b)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? "border-violet bg-violet/15 text-violet-bright"
                    : "border-edge bg-surface text-text-dim hover:border-violet/60 hover:text-text"
                }`}
              >
                {r.a} <span className="opacity-60">vs</span> {r.b}
                <span className="ml-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider opacity-60">
                  {r.sport}
                </span>
              </button>
            );
          })}
          <button
            onClick={surpriseMe}
            className="rounded-full border border-dashed border-cyan/70 px-3.5 py-1.5 text-sm text-cyan hover:bg-cyan/10 transition-colors cursor-pointer"
          >
            🎲 Surprise me
          </button>
        </div>
      </section>

      {/* Build your own — constrained to the database */}
      <section className="mt-8 animate-rise" style={{ animationDelay: "0.18s" }}>
        <h2 className="font-mono text-xs tracking-[0.2em] text-text-dim uppercase">
          Or build your own
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <select
            value={sport}
            onChange={(e) => changeSport(e.target.value)}
            className={selectClass}
            aria-label="Sport"
          >
            <option value="">Choose a sport</option>
            {SPORTS.map((s) => (
              <option key={s.sport} value={s.sport}>
                {s.sport}
              </option>
            ))}
          </select>
          <select
            value={athleteA}
            onChange={(e) => {
              setAthleteA(e.target.value);
              setSide(null);
            }}
            disabled={!sport}
            className={selectClass}
            aria-label="First player"
          >
            <option value="">First player</option>
            {roster
              .filter((name) => name !== athleteB)
              .map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
          <select
            value={athleteB}
            onChange={(e) => {
              setAthleteB(e.target.value);
              setSide(null);
            }}
            disabled={!sport}
            className={selectClass}
            aria-label="Second player"
          >
            <option value="">Second player</option>
            {roster
              .filter((name) => name !== athleteA)
              .map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-text-dim/70">
          Every player here comes with real career stats, so the AI never has to
          make numbers up. More sports and players are on the way.
        </p>
      </section>

      {/* Side selection */}
      <section className="mt-8 animate-rise" style={{ animationDelay: "0.26s" }}>
        <h2 className="font-mono text-xs tracking-[0.2em] text-text-dim uppercase">
          Who are you riding with?
        </h2>
        {ready ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {([["a", athleteA], ["b", athleteB]] as const).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setSide(key)}
                className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  side === key
                    ? "border-violet bg-violet/10 shadow-[0_0_24px_rgba(139,92,246,0.25)]"
                    : "border-edge bg-surface hover:border-violet/50"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] text-text-dim uppercase">
                  Team
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-text">{name}</p>
                <p className="mt-1 text-sm text-text-dim">
                  {side === key ? "You've got this side." : "Tap to argue for them."}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-edge bg-surface/50 p-4 text-sm text-text-dim">
            Pick a matchup above to choose your side.
          </p>
        )}
      </section>

      <div className="mt-10 text-center animate-rise" style={{ animationDelay: "0.34s" }}>
        <button
          onClick={start}
          disabled={!ready || !side}
          className="rounded-xl bg-gradient-to-r from-violet to-cyan px-8 py-3 font-display text-lg font-bold text-ink transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          Start the debate
        </button>
        <p className="mt-3 font-mono text-[11px] tracking-wider text-text-dim/70 uppercase">
          3 rounds · Make your case → Clap back → Bring it home
        </p>
      </div>
    </main>
  );
}
