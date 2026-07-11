"use client";

import { useState } from "react";
import Courtroom from "@/components/Courtroom";
import TopBar from "@/components/TopBar";
import PlayerAvatar from "@/components/PlayerAvatar";
import { SPORTS, athleteNamesFor, imageFor } from "@/lib/matchups";
import type { CaseConfig, Phase, TranscriptEntry, Verdict } from "@/lib/types";
import { PHASES, totalScore } from "@/lib/types";
import { addHistoryEntry, recordResult } from "@/lib/stats";

interface Props {
  live: boolean;
  onExit: () => void;
}

type Stage = "setup" | "semifinal" | "semifinal-result" | "final" | "final-result" | "champion" | "eliminated";
type FailedStage = "counsel" | "judge" | null;

export default function TournamentMode({ live, onExit }: Props) {
  const [sport, setSport] = useState("");
  const [champion, setChampion] = useState("");
  const [opponent1, setOpponent1] = useState("");
  const [opponent2, setOpponent2] = useState("");
  const [stage, setStage] = useState<Stage>("setup");

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [aiDraft, setAiDraft] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [judging, setJudging] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedStage, setFailedStage] = useState<FailedStage>(null);

  const phase: Phase = PHASES[Math.min(phaseIndex, PHASES.length - 1)];
  const roster = athleteNamesFor(sport);
  const ready =
    Boolean(sport && champion && opponent1 && opponent2) &&
    new Set([champion, opponent1, opponent2]).size === 3;

  function currentOpponent(): string {
    return stage === "final" ? opponent2 : opponent1;
  }

  function currentCaseConfig(): CaseConfig {
    return { sport, userAthlete: champion, aiAthlete: currentOpponent(), style: "balanced", mode: "ai" };
  }

  function resetDebateState() {
    setTranscript([]);
    setPhaseIndex(0);
    setAiDraft("");
    setAiStreaming(false);
    setJudging(false);
    setVerdict(null);
    setError(null);
    setFailedStage(null);
  }

  function startTournament() {
    if (!ready) return;
    resetDebateState();
    setStage("semifinal");
  }

  async function runCounsel(c: CaseConfig, t: TranscriptEntry[], p: Phase) {
    setError(null);
    setFailedStage(null);
    setAiStreaming(true);
    setAiDraft("");
    try {
      const res = await fetch("/api/counsel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseConfig: c, transcript: t, phase: p }),
      });
      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error ?? "The AI debater failed to respond.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAiDraft(full);
      }
      if (!full.trim()) throw new Error("The AI debater went silent mid-argument.");

      const withAi: TranscriptEntry[] = [...t, { phase: p, speaker: "ai", athlete: c.aiAthlete, text: full.trim() }];
      setTranscript(withAi);
      setAiStreaming(false);
      setAiDraft("");

      const pIndex = PHASES.indexOf(p);
      if (pIndex === PHASES.length - 1) {
        await runJudge(c, withAi);
      } else {
        setPhaseIndex(pIndex + 1);
      }
    } catch (err) {
      console.error(err);
      setAiStreaming(false);
      setAiDraft("");
      setFailedStage("counsel");
      setError(err instanceof Error && err.message ? err.message : "The AI debater failed to respond.");
    }
  }

  async function runJudge(c: CaseConfig, t: TranscriptEntry[]) {
    setError(null);
    setFailedStage(null);
    setJudging(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseConfig: c, transcript: t }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.verdict) throw new Error(data?.error ?? "The judge failed to reach a verdict.");
      const v = data.verdict as Verdict;
      setVerdict(v);
      recordResult(v.winner === "user");
      addHistoryEntry({
        sport: c.sport,
        userAthlete: c.userAthlete,
        aiAthlete: c.aiAthlete,
        winner: v.winner,
        userTotal: totalScore(v, "user"),
        aiTotal: totalScore(v, "ai"),
        mode: "ai",
      });
      setStage(stage === "final" ? "final-result" : "semifinal-result");
    } catch (err) {
      console.error(err);
      setFailedStage("judge");
      setError(err instanceof Error && err.message ? err.message : "The judge failed to reach a verdict.");
    } finally {
      setJudging(false);
    }
  }

  function submitArgument(text: string) {
    const c = currentCaseConfig();
    const withUser: TranscriptEntry[] = [...transcript, { phase, speaker: "user", athlete: champion, text }];
    setTranscript(withUser);
    void runCounsel(c, withUser, phase);
  }

  function retry() {
    const c = currentCaseConfig();
    if (failedStage === "judge") void runJudge(c, transcript);
    else void runCounsel(c, transcript, phase);
  }

  function advanceToFinal() {
    resetDebateState();
    setStage("final");
  }

  function finishTournament(won: boolean) {
    setStage(won ? "champion" : "eliminated");
  }

  function restartSetup() {
    setSport("");
    setChampion("");
    setOpponent1("");
    setOpponent2("");
    resetDebateState();
    setStage("setup");
  }

  // Route to championship / elimination once a result screen is showing.
  if (stage === "semifinal-result" && verdict) {
    const won = verdict.winner === "user";
    return (
      <ResultScreen
        won={won}
        champion={champion}
        opponent={opponent1}
        verdict={verdict}
        sport={sport}
        primaryLabel={won ? "Advance to the final →" : "Try again"}
        onPrimary={won ? advanceToFinal : restartSetup}
        onExit={onExit}
        subtitle={won ? "Semifinal won. One more debate to go." : "Knocked out in the semifinal."}
      />
    );
  }

  if (stage === "final-result" && verdict) {
    const won = verdict.winner === "user";
    return (
      <ResultScreen
        won={won}
        champion={champion}
        opponent={opponent2}
        verdict={verdict}
        sport={sport}
        primaryLabel={won ? "🏆 Claim the crown" : "Try again"}
        onPrimary={() => (won ? finishTournament(true) : restartSetup())}
        onExit={onExit}
        subtitle={won ? "Final won. You're one tap from the title." : "So close. Knocked out in the final."}
      />
    );
  }

  if (stage === "champion") {
    return (
      <>
        <TopBar onHome={onExit} />
        <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
          <PlayerAvatar
            name={champion}
            image={imageFor(sport, champion)}
            size={110}
            className="card-shadow animate-trophy mx-auto ring-4 ring-accent/30"
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent">Tournament champion</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-text">
            {champion} <span className="text-accent">is the GOAT</span>
          </h1>
          <p className="mt-2 text-text-dim">
            Beat {opponent1} and {opponent2} back to back in the {sport} bracket.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={restartSetup}
              className="rounded-xl bg-accent px-6 py-2.5 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 hover:bg-accent-bright transition-all cursor-pointer"
            >
              New tournament
            </button>
            <button
              onClick={onExit}
              className="rounded-xl border border-edge bg-surface px-6 py-2.5 font-display font-bold text-text hover:border-accent/50 transition-all cursor-pointer"
            >
              Exit
            </button>
          </div>
        </main>
      </>
    );
  }

  if (stage === "eliminated") {
    return (
      <>
        <TopBar onHome={onExit} />
        <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
          <PlayerAvatar name={champion} image={imageFor(sport, champion)} size={96} className="card-shadow mx-auto" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral">Eliminated</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">The run ends here</h1>
          <p className="mt-2 text-text-dim">Run it back with a new bracket.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={restartSetup}
              className="rounded-xl bg-accent px-6 py-2.5 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 hover:bg-accent-bright transition-all cursor-pointer"
            >
              New tournament
            </button>
            <button
              onClick={onExit}
              className="rounded-xl border border-edge bg-surface px-6 py-2.5 font-display font-bold text-text hover:border-accent/50 transition-all cursor-pointer"
            >
              Exit
            </button>
          </div>
        </main>
      </>
    );
  }

  if (stage === "semifinal" || stage === "final") {
    return (
      <>
        <div className="border-b border-edge/60 bg-accent/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-accent">
          {stage === "semifinal" ? "Semifinal" : "Final"} · {champion}&rsquo;s bracket run
        </div>
        <Courtroom
          caseConfig={currentCaseConfig()}
          transcript={transcript}
          phase={phase}
          aiDraft={aiDraft}
          aiStreaming={aiStreaming}
          judging={judging}
          error={error}
          live={live}
          onSubmit={submitArgument}
          onRetry={retry}
          onBack={onExit}
        />
      </>
    );
  }

  // Setup screen
  return (
    <>
      <TopBar onHome={onExit} />
      <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
            🏆 <span className="text-accent">Tournament</span> mode
          </h1>
          <p className="mt-3 text-text-dim">
            Pick your champion and two opponents. Beat them both, back to back, to be crowned GOAT.
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-dim">Sport</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SPORTS.map((s) => (
              <button
                key={s.sport}
                onClick={() => {
                  setSport(s.sport);
                  setChampion("");
                  setOpponent1("");
                  setOpponent2("");
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  sport === s.sport
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-edge text-text-dim hover:text-text"
                }`}
              >
                {s.sport}
              </button>
            ))}
          </div>
        </section>

        {sport && (
          <section className="mt-6 grid gap-3">
            {[
              { label: "Your champion", value: champion, set: setChampion, exclude: [opponent1, opponent2] },
              { label: "Opponent 1 (semifinal)", value: opponent1, set: setOpponent1, exclude: [champion, opponent2] },
              { label: "Opponent 2 (final)", value: opponent2, set: setOpponent2, exclude: [champion, opponent1] },
            ].map((slot) => (
              <div key={slot.label}>
                <label className="text-xs font-semibold text-text-dim">{slot.label}</label>
                <select
                  value={slot.value}
                  onChange={(e) => slot.set(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors cursor-pointer"
                >
                  <option value="">Choose a player</option>
                  {roster
                    .filter((n) => !slot.exclude.includes(n))
                    .map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </section>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={startTournament}
            disabled={!ready}
            className="rounded-xl bg-accent px-8 py-3 font-display text-lg font-bold text-accent-ink shadow-lg shadow-accent/20 transition-all hover:bg-accent-bright hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100 cursor-pointer"
          >
            Start the bracket
          </button>
        </div>
      </main>
    </>
  );
}

function ResultScreen({
  won,
  champion,
  opponent,
  verdict,
  sport,
  primaryLabel,
  onPrimary,
  onExit,
  subtitle,
}: {
  won: boolean;
  champion: string;
  opponent: string;
  verdict: Verdict;
  sport: string;
  primaryLabel: string;
  onPrimary: () => void;
  onExit: () => void;
  subtitle: string;
}) {
  const userTotal = totalScore(verdict, "user");
  const aiTotal = totalScore(verdict, "ai");
  return (
    <>
      <TopBar onHome={onExit} />
      <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12 text-center">
        <PlayerAvatar
          name={won ? champion : opponent}
          image={imageFor(sport, won ? champion : opponent)}
          size={88}
          className="card-shadow mx-auto"
        />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent">
          {won ? "Round won" : "Round lost"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-text">
          {champion} {userTotal}-{aiTotal} {opponent}
        </h1>
        <p className="mt-2 text-text-dim">{subtitle}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-text-dim">{verdict.opinion}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={onPrimary}
            className="rounded-xl bg-accent px-6 py-2.5 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 hover:bg-accent-bright hover:scale-[1.02] transition-all cursor-pointer"
          >
            {primaryLabel}
          </button>
          <button
            onClick={onExit}
            className="rounded-xl border border-edge bg-surface px-6 py-2.5 font-display font-bold text-text hover:border-accent/50 transition-all cursor-pointer"
          >
            Exit
          </button>
        </div>
      </main>
    </>
  );
}
