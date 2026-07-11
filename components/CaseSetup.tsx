"use client";

import { useState } from "react";
import { RIVALRIES, randomRivalry } from "@/lib/matchups";
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

  const ready = sport.trim() && athleteA.trim() && athleteB.trim();

  function pickRivalry(sport: string, a: string, b: string) {
    setSport(sport);
    setAthleteA(a);
    setAthleteB(b);
    setSide(null);
  }

  function surpriseMe() {
    const r = randomRivalry();
    pickRivalry(r.sport, r.a, r.b);
  }

  function start() {
    if (!ready || !side) return;
    const [user, ai] =
      side === "a" ? [athleteA, athleteB] : [athleteB, athleteA];
    onStart({
      sport: sport.trim(),
      userAthlete: user.trim(),
      aiAthlete: ai.trim(),
    });
  }

  const inputClass =
    "w-full rounded-md border border-line bg-panel px-3 py-2.5 text-parchment placeholder:text-parchment-dim/60 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 transition-colors";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-16">
      {/* Masthead */}
      <header className="text-center animate-rise">
        <p className="font-mono text-xs tracking-[0.35em] text-brass uppercase">
          The Honorable Court of
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-parchment sm:text-7xl">
          GOAT Court
        </h1>
        <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-brass to-transparent" />
        <p className="mt-4 font-display italic text-parchment-dim">
          Put greatness on trial. Argue your athlete&rsquo;s case against an AI
          lawyer armed with real stats — and let the judge decide.
        </p>
        {!live && (
          <span className="mt-4 inline-block rounded-full border border-crimson/60 bg-crimson-deep/30 px-3 py-1 font-mono text-[11px] tracking-widest text-parchment uppercase">
            Demo mode — no API key configured
          </span>
        )}
      </header>

      {/* Docket picker */}
      <section className="mt-10 animate-rise" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-mono text-xs tracking-[0.25em] text-parchment-dim uppercase">
          I. Select a case from the docket
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {RIVALRIES.map((r) => {
            const active = sport === r.sport && athleteA === r.a && athleteB === r.b;
            return (
              <button
                key={`${r.a}-${r.b}`}
                onClick={() => pickRivalry(r.sport, r.a, r.b)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? "border-brass bg-brass/15 text-brass-bright"
                    : "border-line bg-panel text-parchment-dim hover:border-brass/60 hover:text-parchment"
                }`}
              >
                {r.a} v. {r.b}
                <span className="ml-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider opacity-60">
                  {r.sport}
                </span>
              </button>
            );
          })}
          <button
            onClick={surpriseMe}
            className="rounded-full border border-dashed border-brass/70 px-3.5 py-1.5 text-sm text-brass hover:bg-brass/10 transition-colors cursor-pointer"
          >
            ⚖ Let the court pick
          </button>
        </div>
      </section>

      {/* Custom case */}
      <section className="mt-8 animate-rise" style={{ animationDelay: "0.18s" }}>
        <h2 className="font-mono text-xs tracking-[0.25em] text-parchment-dim uppercase">
          II. Or file your own — any sport, any two legends
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="Sport (e.g. Chess)"
            className={inputClass}
            aria-label="Sport"
          />
          <input
            value={athleteA}
            onChange={(e) => { setAthleteA(e.target.value); setSide(null); }}
            placeholder="First athlete"
            className={inputClass}
            aria-label="First athlete"
          />
          <input
            value={athleteB}
            onChange={(e) => { setAthleteB(e.target.value); setSide(null); }}
            placeholder="Second athlete"
            className={inputClass}
            aria-label="Second athlete"
          />
        </div>
      </section>

      {/* Side selection */}
      <section className="mt-8 animate-rise" style={{ animationDelay: "0.26s" }}>
        <h2 className="font-mono text-xs tracking-[0.25em] text-parchment-dim uppercase">
          III. Choose whom you represent
        </h2>
        {ready ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {([["a", athleteA], ["b", athleteB]] as const).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setSide(key)}
                className={`rounded-lg border p-4 text-left transition-all cursor-pointer ${
                  side === key
                    ? "border-brass bg-brass/10 shadow-[0_0_24px_rgba(201,162,39,0.15)]"
                    : "border-line bg-panel hover:border-brass/50"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] text-parchment-dim uppercase">
                  Counsel for
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-parchment">
                  {name.trim() || "—"}
                </p>
                <p className="mt-1 text-sm text-parchment-dim">
                  {side === key
                    ? "You will argue this legend is the GOAT."
                    : "Tap to take this side."}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-line bg-panel/50 p-4 text-sm text-parchment-dim">
            Select a case from the docket or fill in a sport and two athletes to
            choose your side.
          </p>
        )}
      </section>

      <div className="mt-10 text-center animate-rise" style={{ animationDelay: "0.34s" }}>
        <button
          onClick={start}
          disabled={!ready || !side}
          className="rounded-md border border-brass bg-brass px-8 py-3 font-display text-lg font-bold text-bench transition-all hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
        >
          Call the court to order
        </button>
        <p className="mt-3 font-mono text-[11px] tracking-wider text-parchment-dim/70 uppercase">
          Three rounds · Opening · Rebuttal · Closing
        </p>
      </div>
    </main>
  );
}
