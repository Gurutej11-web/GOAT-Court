"use client";

import { useState } from "react";
import { FEATURED, SPORTS, athleteNamesFor, imageFor, randomMatchup } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
import type { CaseConfig } from "@/lib/types";

interface Props {
  live: boolean;
  savedAvailable: boolean;
  onStart: (c: CaseConfig) => void;
  onResume: () => void;
}

type Mode = "database" | "custom";

export default function CaseSetup({ live, savedAvailable, onStart, onResume }: Props) {
  const [mode, setMode] = useState<Mode>("database");
  const [sport, setSport] = useState("");
  const [athleteA, setAthleteA] = useState("");
  const [athleteB, setAthleteB] = useState("");
  const [side, setSide] = useState<"a" | "b" | null>(null);

  const ready = Boolean(sport.trim() && athleteA.trim() && athleteB.trim());
  const roster = mode === "database" ? athleteNamesFor(sport) : [];

  function reset() {
    setSport("");
    setAthleteA("");
    setAthleteB("");
    setSide(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  function pickMatchup(newSport: string, a: string, b: string) {
    setMode("database");
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
    const a = athleteA.trim();
    const b = athleteB.trim();
    const [user, ai] = side === "a" ? [a, b] : [b, a];
    onStart({ sport: sport.trim(), userAthlete: user, aiAthlete: ai });
  }

  const fieldClass =
    "w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-text placeholder:text-text-dim/50 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/40 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

  const imgA = mode === "database" ? imageFor(sport, athleteA) : null;
  const imgB = mode === "database" ? imageFor(sport, athleteB) : null;

  return (
    <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-20">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-6xl">
          <span className="bg-gradient-to-r from-violet-bright to-cyan bg-clip-text text-transparent">
            GOAT
          </span>{" "}
          Court
        </h1>
        <p className="mt-3 text-text-dim">
          Pick two legends, argue your side, let an AI judge settle it.
        </p>
        {!live && (
          <span className="mt-3 inline-block rounded-full border border-cyan/40 bg-cyan-deep/15 px-3 py-1 text-xs text-text-dim">
            Demo mode · no API key yet
          </span>
        )}
      </header>

      {savedAvailable && (
        <button
          onClick={onResume}
          className="mt-6 flex w-full items-center justify-between rounded-lg border border-violet/50 bg-violet/10 px-4 py-3 text-left transition-colors hover:bg-violet/15 cursor-pointer"
        >
          <span className="text-sm text-text">You've got a debate in progress.</span>
          <span className="text-sm font-semibold text-violet-bright">Continue →</span>
        </button>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap gap-2">
          {FEATURED.map((r) => {
            const isSelected = mode === "database" && sport === r.sport && athleteA === r.a && athleteB === r.b;
            return (
              <button
                key={`${r.a}-${r.b}`}
                onClick={() => pickMatchup(r.sport, r.a, r.b)}
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? "border-violet bg-violet/15 text-violet-bright"
                    : "border-edge bg-surface text-text-dim hover:border-violet/60 hover:text-text"
                }`}
              >
                <span className="flex -space-x-2">
                  <PlayerAvatar name={r.a} image={imageFor(r.sport, r.a)} size={22} className="ring-2 ring-ink" />
                  <PlayerAvatar name={r.b} image={imageFor(r.sport, r.b)} size={22} className="ring-2 ring-ink" />
                </span>
                {r.a} <span className="opacity-50">vs</span> {r.b}
              </button>
            );
          })}
          <button
            onClick={surpriseMe}
            className="rounded-full border border-dashed border-cyan/60 px-3.5 py-1.5 text-sm text-cyan hover:bg-cyan/10 transition-colors cursor-pointer"
          >
            🎲 Surprise me
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex gap-1 rounded-lg border border-edge bg-surface p-1 text-sm">
          <button
            onClick={() => switchMode("database")}
            className={`flex-1 rounded-md py-1.5 transition-colors cursor-pointer ${
              mode === "database" ? "bg-violet/20 text-violet-bright" : "text-text-dim hover:text-text"
            }`}
          >
            From the database
          </button>
          <button
            onClick={() => switchMode("custom")}
            className={`flex-1 rounded-md py-1.5 transition-colors cursor-pointer ${
              mode === "custom" ? "bg-violet/20 text-violet-bright" : "text-text-dim hover:text-text"
            }`}
          >
            Type your own
          </button>
        </div>

        {mode === "database" ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select
              value={sport}
              onChange={(e) => changeSport(e.target.value)}
              className={fieldClass}
              aria-label="Sport"
            >
              <option value="">Sport</option>
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
              className={fieldClass}
              aria-label="First player"
            >
              <option value="">First player</option>
              {roster.filter((n) => n !== athleteB).map((name) => (
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
              className={fieldClass}
              aria-label="Second player"
            >
              <option value="">Second player</option>
              {roster.filter((n) => n !== athleteA).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <input
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setSide(null);
              }}
              placeholder="Sport (e.g. Chess)"
              className={fieldClass}
              aria-label="Sport"
            />
            <input
              value={athleteA}
              onChange={(e) => {
                setAthleteA(e.target.value);
                setSide(null);
              }}
              placeholder="First player"
              className={fieldClass}
              aria-label="First player"
            />
            <input
              value={athleteB}
              onChange={(e) => {
                setAthleteB(e.target.value);
                setSide(null);
              }}
              placeholder="Second player"
              className={fieldClass}
              aria-label="Second player"
            />
          </div>
        )}
        {mode === "custom" && (
          <p className="mt-2 text-xs text-text-dim/70">
            The AI still won't make up stats for players it doesn't know well. It'll argue on what it
            actually knows.
          </p>
        )}
      </section>

      {ready && (
        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {([["a", athleteA, imgA], ["b", athleteB, imgB]] as const).map(([key, name, img]) => (
              <button
                key={key}
                onClick={() => setSide(key)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  side === key
                    ? "border-violet bg-violet/10 shadow-[0_0_24px_rgba(139,92,246,0.25)]"
                    : "border-edge bg-surface hover:border-violet/50"
                }`}
              >
                <PlayerAvatar name={name} image={img} size={48} />
                <div>
                  <p className="font-display text-lg font-bold text-text">{name}</p>
                  <p className="text-sm text-text-dim">
                    {side === key ? "You've got this side" : "Tap to argue for them"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={start}
          disabled={!ready || !side}
          className="rounded-xl bg-gradient-to-r from-violet to-cyan px-8 py-3 font-display text-lg font-bold text-ink transition-all hover:opacity-90 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
        >
          Start the debate
        </button>
        <p className="mt-3 text-xs text-text-dim/70">
          3 rounds · Make your case → Clap back → Bring it home
        </p>
      </div>
    </main>
  );
}
