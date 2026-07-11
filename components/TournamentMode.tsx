"use client";

import { useState } from "react";
import Courtroom from "@/components/Courtroom";
import TopBar from "@/components/TopBar";
import PlayerAvatar from "@/components/PlayerAvatar";
import AutocompleteInput from "@/components/AutocompleteInput";
import { imageFor, suggestAthletes, suggestSports } from "@/lib/matchups";
import type { CaseConfig, Phase, TranscriptEntry, Verdict } from "@/lib/types";
import { PHASES, totalScore } from "@/lib/types";
import { addHistoryEntry, recordResult } from "@/lib/stats";

interface Props {
  live: boolean;
  onExit: () => void;
}

type Round = "quarterfinal" | "semifinal" | "final";
const ROUNDS: Round[] = ["quarterfinal", "semifinal", "final"];
const ROUND_LABELS: Record<Round, string> = {
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  final: "Final",
};

type Stage = "setup" | "debate" | "result" | "champion" | "eliminated";
type FailedStage = "counsel" | "judge" | null;

export default function TournamentMode({ live, onExit }: Props) {
  const [sport, setSport] = useState("");
  const [champion, setChampion] = useState("");
  const [opponents, setOpponents] = useState<[string, string, string]>(["", "", ""]);
  const [roundIndex, setRoundIndex] = useState(0);
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
  const round: Round = ROUNDS[Math.min(roundIndex, ROUNDS.length - 1)];
  const opponent = opponents[roundIndex];

  const allNames = [champion, ...opponents].map((n) => n.trim());
  const ready =
    Boolean(sport.trim()) &&
    allNames.every((n) => n.length > 0) &&
    new Set(allNames.map((n) => n.toLowerCase())).size === allNames.length;

  function currentCaseConfig(): CaseConfig {
    return {
      sport: sport.trim(),
      userAthlete: champion.trim(),
      aiAthlete: opponent.trim(),
      style: "balanced",
      mode: "ai",
    };
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

  function setOpponent(i: number, value: string) {
    setOpponents((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = value;
      return next;
    });
  }

  function startTournament() {
    if (!ready) return;
    resetDebateState();
    setRoundIndex(0);
    setStage("debate");
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
      const userWords = t
        .filter((entry) => entry.speaker === "user")
        .reduce((sum, entry) => sum + entry.text.trim().split(/\s+/).filter(Boolean).length, 0);
      recordResult(v.winner === "user");
      addHistoryEntry({
        sport: c.sport,
        userAthlete: c.userAthlete,
        aiAthlete: c.aiAthlete,
        winner: v.winner,
        userTotal: totalScore(v, "user"),
        aiTotal: totalScore(v, "ai"),
        mode: "ai",
        userWords,
      });
      setStage("result");
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

  function advance() {
    if (roundIndex === ROUNDS.length - 1) {
      setStage("champion");
      return;
    }
    resetDebateState();
    setRoundIndex((i) => i + 1);
    setStage("debate");
  }

  function restartSetup() {
    setSport("");
    setChampion("");
    setOpponents(["", "", ""]);
    resetDebateState();
    setRoundIndex(0);
    setStage("setup");
  }

  const fieldClass =
    "w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";

  if (stage === "result" && verdict) {
    const won = verdict.winner === "user";
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
            {won ? `${ROUND_LABELS[round]} won` : `${ROUND_LABELS[round]} lost`}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">
            {champion} {userTotal}-{aiTotal} {opponent}
          </h1>
          <p className="mt-2 text-text-dim">
            {won
              ? roundIndex === ROUNDS.length - 1
                ? "Final won. One tap from the title."
                : `${ROUND_LABELS[round]} won. On to the ${ROUND_LABELS[ROUNDS[roundIndex + 1]].toLowerCase()}.`
              : `Knocked out in the ${ROUND_LABELS[round].toLowerCase()}.`}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm text-text-dim">{verdict.opinion}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={won ? advance : restartSetup}
              className="rounded-xl bg-accent px-6 py-2.5 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 hover:bg-accent-bright hover:scale-[1.02] transition-all cursor-pointer"
            >
              {won
                ? roundIndex === ROUNDS.length - 1
                  ? "Claim the crown"
                  : `Advance to the ${ROUND_LABELS[ROUNDS[roundIndex + 1]]} →`
                : "Try again"}
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
            Beat {opponents.join(", ")} back to back to take the {sport} bracket.
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

  if (stage === "debate") {
    return (
      <>
        <div className="border-b border-edge/60 bg-accent/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-accent">
          {ROUND_LABELS[round]} ({roundIndex + 1}/{ROUNDS.length}) · {champion}&rsquo;s bracket run
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
          onDelete={restartSetup}
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
            <span className="text-accent">Tournament</span> mode
          </h1>
          <p className="mt-3 text-text-dim">
            Pick your champion and three opponents. Beat them all, back to back, quarterfinal to
            final, to be crowned bracket GOAT.
          </p>
        </header>

        <section className="mt-8">
          <label className="text-xs font-semibold uppercase tracking-wide text-text-dim">Sport</label>
          <div className="mt-2">
            <AutocompleteInput
              value={sport}
              onChange={setSport}
              suggestions={suggestSports(sport)}
              placeholder="Sport"
              ariaLabel="Sport"
              className={fieldClass}
            />
          </div>
        </section>

        <section className="mt-4 grid gap-3">
          <div>
            <label className="text-xs font-semibold text-text-dim">Your champion</label>
            <div className="mt-1">
              <AutocompleteInput
                value={champion}
                onChange={setChampion}
                suggestions={suggestAthletes(champion, sport, "")}
                placeholder="Who's your pick?"
                ariaLabel="Champion"
                className={fieldClass}
              />
            </div>
          </div>
          {ROUNDS.map((r, i) => (
            <div key={r}>
              <label className="text-xs font-semibold text-text-dim">
                Opponent {i + 1} ({ROUND_LABELS[r]})
              </label>
              <div className="mt-1">
                <AutocompleteInput
                  value={opponents[i]}
                  onChange={(v) => setOpponent(i, v)}
                  suggestions={suggestAthletes(opponents[i], sport, champion)}
                  placeholder={`Who do they face in the ${ROUND_LABELS[r].toLowerCase()}?`}
                  ariaLabel={`Opponent ${i + 1}`}
                  className={fieldClass}
                />
              </div>
            </div>
          ))}
        </section>

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
