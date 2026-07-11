"use client";

import { useEffect, useState } from "react";
import { ALL_ATHLETES, FEATURED, SPORTS, imageFor, randomMatchup, suggestAthletes, suggestSports } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
import AutocompleteInput from "@/components/AutocompleteInput";
import ThemeToggle from "@/components/ThemeToggle";
import HistoryPanel from "@/components/HistoryPanel";
import Dashboard from "@/components/Dashboard";
import OddsPreview from "@/components/OddsPreview";
import { debateOfTheDay } from "@/lib/dailyMatchup";
import type { CaseConfig, DebateMode, DebateStyle, Matchup } from "@/lib/types";
import { STYLES } from "@/lib/types";
import { buildChallengeUrl } from "@/lib/challenge";
import { hasOnboarded, loadStats, markOnboarded, type StatsRecord } from "@/lib/stats";

const EMPTY_STATS: StatsRecord = { wins: 0, losses: 0, streak: 0 };

interface Props {
  live: boolean;
  savedAvailable: boolean;
  initialMatchup: (Matchup & { defaultSide?: "a" | "b" }) | null;
  onStart: (c: CaseConfig) => void;
  onResume: () => void;
  onEnterTournament: () => void;
}

export default function CaseSetup({
  live,
  savedAvailable,
  initialMatchup,
  onStart,
  onResume,
  onEnterTournament,
}: Props) {
  const [sport, setSport] = useState("");
  const [athleteA, setAthleteA] = useState("");
  const [athleteB, setAthleteB] = useState("");
  const [side, setSide] = useState<"a" | "b" | null>(null);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [style, setStyle] = useState<DebateStyle>("balanced");
  const [mode, setMode] = useState<DebateMode>("ai");
  const [showHistory, setShowHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState<StatsRecord>(EMPTY_STATS);
  const [daily] = useState(() => debateOfTheDay());

  // These read localStorage/props seeded from the URL, which must happen
  // after mount (not during render) to stay SSR-safe.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(loadStats());
    setShowOnboarding(!hasOnboarded());
  }, []);

  useEffect(() => {
    if (!initialMatchup) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSport(initialMatchup.sport);
    setAthleteA(initialMatchup.a);
    setAthleteB(initialMatchup.b);
    if (initialMatchup.defaultSide) setSide(initialMatchup.defaultSide);
  }, [initialMatchup]);

  const ready = Boolean(sport.trim() && athleteA.trim() && athleteB.trim());

  function dismissOnboarding() {
    markOnboarded();
    setShowOnboarding(false);
  }

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

  /** If a known player is picked before a sport is chosen, fill the sport in too. */
  function inferSport(name: string): string | undefined {
    return ALL_ATHLETES.find((e) => e.athlete.name.toLowerCase() === name.trim().toLowerCase())?.sport;
  }

  function changeAthleteA(value: string) {
    setAthleteA(value);
    setSide(null);
    if (!sport.trim()) {
      const inferred = inferSport(value);
      if (inferred) setSport(inferred);
    }
  }

  function changeAthleteB(value: string) {
    setAthleteB(value);
    setSide(null);
    if (!sport.trim()) {
      const inferred = inferSport(value);
      if (inferred) setSport(inferred);
    }
  }

  function start() {
    if (!ready || !side) return;
    const a = athleteA.trim();
    const b = athleteB.trim();
    const [user, ai] = side === "a" ? [a, b] : [b, a];
    onStart({ sport: sport.trim(), userAthlete: user, aiAthlete: ai, style, mode });
  }

  async function copyChallengeLink() {
    if (!ready) return;
    const url = buildChallengeUrl({
      sport: sport.trim(),
      a: athleteA.trim(),
      b: athleteB.trim(),
      side: side ?? undefined,
    });
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard unavailable, nothing to do
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";

  const imgA = imageFor(sport, athleteA);
  const imgB = imageFor(sport, athleteB);
  const visibleFeatured = sportFilter ? FEATURED.filter((r) => r.sport === sportFilter) : FEATURED;
  const sportsInFeatured = Array.from(new Set(FEATURED.map((r) => r.sport)));
  const totalGames = stats.wins + stats.losses;

  return (
    <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs text-text-dim hover:text-text transition-colors cursor-pointer"
          >
            History
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            className="text-xs text-text-dim hover:text-text transition-colors cursor-pointer"
          >
            Dashboard
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterTournament}
            className="text-xs text-text-dim hover:text-text transition-colors cursor-pointer"
          >
            Tournament
          </button>
          <ThemeToggle />
        </div>
      </div>

      <header className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-6xl">
          <span className="text-accent">GOAT</span> Court
        </h1>
        <p className="mt-3 text-text-dim">
          Pick two legends, argue your side, let an AI judge settle it.
        </p>
        {totalGames > 0 && (
          <p className="mt-2 text-xs text-text-dim">
            You&apos;re {stats.wins}-{stats.losses} against the AI
            {stats.streak >= 2 && ` · ${stats.streak}-win streak`}
            {stats.streak <= -2 && ` · ${Math.abs(stats.streak)}-loss skid`}
          </p>
        )}
        {!live && (
          <span className="mt-3 inline-block rounded-full border border-edge px-3 py-1 text-xs text-text-dim">
            Demo mode · no API key yet
          </span>
        )}
      </header>

      {showOnboarding && (
        <div className="card-shadow mt-6 rounded-lg border border-accent/40 bg-accent/5 p-4 text-sm">
          <p className="text-text">
            New here? Pick a matchup below, choose your side, and argue why your pick is the GOAT
            across three rounds. The AI argues back with real stats, then a judge scores it.
          </p>
          <button
            onClick={dismissOnboarding}
            className="mt-2 font-semibold text-accent hover:opacity-80 transition-opacity cursor-pointer"
          >
            Got it
          </button>
        </div>
      )}

      <button
        onClick={() => pickMatchup(daily.sport, daily.a, daily.b)}
        className="card-shadow mt-6 flex w-full items-center justify-between rounded-lg border border-edge bg-surface px-4 py-3 text-left transition-colors hover:border-accent/50 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm text-text">
          <span className="text-accent">Debate of the day:</span> {daily.a} vs {daily.b}
        </span>
        <span className="text-xs text-text-dim">{daily.sport}</span>
      </button>

      {savedAvailable && (
        <button
          onClick={onResume}
          className="card-shadow mt-6 flex w-full items-center justify-between rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 text-left transition-colors hover:bg-accent/15 cursor-pointer"
        >
          <span className="text-sm text-text">You&apos;ve got a debate in progress.</span>
          <span className="text-sm font-semibold text-accent">Continue →</span>
        </button>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSportFilter(null)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer ${
              sportFilter === null
                ? "border-accent bg-accent/15 text-accent"
                : "border-edge text-text-dim hover:text-text"
            }`}
          >
            All sports
          </button>
          {sportsInFeatured.map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer ${
                sportFilter === s
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-edge text-text-dim hover:text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleFeatured.map((r, i) => {
            const isSelected = sport === r.sport && athleteA === r.a && athleteB === r.b;
            return (
              <button
                key={`${r.a}-${r.b}`}
                onClick={() => pickMatchup(r.sport, r.a, r.b)}
                style={{ animationDelay: `${i * 0.04}s` }}
                className={`card-shadow animate-rise flex w-full items-center justify-between gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-edge bg-surface text-text-dim hover:border-accent/50 hover:text-text"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="flex shrink-0 -space-x-2">
                    <PlayerAvatar name={r.a} image={imageFor(r.sport, r.a)} size={24} className="ring-2 ring-page" />
                    <PlayerAvatar name={r.b} image={imageFor(r.sport, r.b)} size={24} className="ring-2 ring-page" />
                  </span>
                  <span className="truncate">
                    {r.a} <span className="opacity-50">vs</span> {r.b}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-text-dim/60">
                  {r.sport}
                </span>
              </button>
            );
          })}
          <button
            onClick={surpriseMe}
            className="card-shadow rounded-full border border-dashed border-edge px-3.5 py-1.5 text-sm text-text-dim transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent cursor-pointer"
          >
            Surprise me
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Or type any matchup
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <AutocompleteInput
            value={sport}
            onChange={(v) => {
              setSport(v);
              setSide(null);
            }}
            suggestions={suggestSports(sport)}
            placeholder="Sport"
            ariaLabel="Sport"
            className={fieldClass}
          />
          <AutocompleteInput
            value={athleteA}
            onChange={changeAthleteA}
            suggestions={suggestAthletes(athleteA, sport, athleteB)}
            placeholder="First player"
            ariaLabel="First player"
            className={fieldClass}
          />
          <AutocompleteInput
            value={athleteB}
            onChange={changeAthleteB}
            suggestions={suggestAthletes(athleteB, sport, athleteA)}
            placeholder="Second player"
            ariaLabel="Second player"
            className={fieldClass}
          />
        </div>
        <p className="mt-2 text-xs text-text-dim/70">
          {`Start typing for suggestions from our growing roster (${ALL_ATHLETES.length} players across ${SPORTS.length} sports), or enter anyone. The AI won't invent stats for players it doesn't know well.`}
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-dim">AI style</h2>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  style === s.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-edge text-text-dim hover:text-text"
                }`}
              >
                <p className="font-semibold">{s.label}</p>
                <p className="text-text-dim/80">{s.blurb}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-dim">Opponent</h2>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setMode("ai")}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                mode === "ai" ? "border-accent bg-accent/10 text-accent" : "border-edge text-text-dim hover:text-text"
              }`}
            >
              <p className="font-semibold">The AI</p>
              <p className="text-text-dim/80">Classic mode</p>
            </button>
            <button
              onClick={() => setMode("friend")}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                mode === "friend"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-edge text-text-dim hover:text-text"
              }`}
            >
              <p className="font-semibold">A friend</p>
              <p className="text-text-dim/80">Pass the device</p>
            </button>
          </div>
        </div>
      </section>

      {ready && <OddsPreview sport={sport} a={athleteA} b={athleteB} />}

      {ready && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            {mode === "friend" ? "Who does Player 1 argue for?" : "Who are you riding with?"}
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([["a", athleteA, imgA], ["b", athleteB, imgB]] as const).map(([key, name, img]) => (
              <button
                key={key}
                onClick={() => setSide(key)}
                className={`card-shadow flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 sm:p-4 cursor-pointer ${
                  side === key
                    ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(245,165,36,0.2)]"
                    : "border-edge bg-surface hover:border-accent/50"
                }`}
              >
                <PlayerAvatar name={name} image={img} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-text sm:text-lg">{name}</p>
                  <p className="truncate text-xs text-text-dim sm:text-sm">
                    {side === key ? "Locked in" : "Tap to argue for them"}
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
          className="rounded-xl bg-accent px-8 py-3 font-display text-lg font-bold text-accent-ink shadow-lg shadow-accent/20 transition-all hover:bg-accent-bright hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100 cursor-pointer"
        >
          Start the debate
        </button>
        <p className="mt-3 text-xs text-text-dim/70">
          3 rounds · Make your case → Clap back → Bring it home
        </p>
        {ready && (
          <button
            onClick={copyChallengeLink}
            className="mt-4 text-xs text-text-dim hover:text-accent transition-colors cursor-pointer"
          >
            {linkCopied ? "Link copied!" : "Copy a challenge link for a friend"}
          </button>
        )}
      </div>

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
    </main>
  );
}
