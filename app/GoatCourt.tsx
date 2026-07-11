"use client";

import { useEffect, useState } from "react";
import CaseSetup from "@/components/CaseSetup";
import Courtroom from "@/components/Courtroom";
import VerdictScene from "@/components/VerdictScene";
import TournamentMode from "@/components/TournamentMode";
import type { CaseConfig, Matchup, Phase, TranscriptEntry, Verdict } from "@/lib/types";
import { PHASES, totalScore } from "@/lib/types";
import { addHistoryEntry, recordResult } from "@/lib/stats";

type FailedStage = "counsel" | "judge" | null;

const STORAGE_KEY = "goat-court-save-v1";

interface SavedState {
  caseConfig: CaseConfig;
  transcript: TranscriptEntry[];
  phaseIndex: number;
  verdict: Verdict | null;
}

function loadSaved(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}

function persist(state: SavedState | null) {
  if (typeof window === "undefined") return;
  try {
    if (state) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable, nothing to do
  }
}

function readChallengeFromUrl(): (Matchup & { defaultSide?: "a" | "b" }) | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("challenge");
    if (!encoded) return null;
    const decoded = JSON.parse(decodeURIComponent(atob(encoded))) as {
      sport: string;
      a: string;
      b: string;
      side?: "a" | "b";
    };
    if (!decoded.sport || !decoded.a || !decoded.b) return null;
    // The friend gets the opposite side by default, so it's you-vs-them on the same matchup.
    const defaultSide = decoded.side === "a" ? "b" : decoded.side === "b" ? "a" : undefined;
    return { sport: decoded.sport, a: decoded.a, b: decoded.b, defaultSide };
  } catch {
    return null;
  }
}

export default function GoatCourt({ live }: { live: boolean }) {
  const [caseConfig, setCaseConfig] = useState<CaseConfig | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [aiDraft, setAiDraft] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [judging, setJudging] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedStage, setFailedStage] = useState<FailedStage>(null);
  const [savedAvailable, setSavedAvailable] = useState(false);
  const [initialMatchup, setInitialMatchup] = useState<(Matchup & { defaultSide?: "a" | "b" }) | null>(null);
  const [tournamentOpen, setTournamentOpen] = useState(false);

  const phase: Phase = PHASES[Math.min(phaseIndex, PHASES.length - 1)];

  // A debate from a previous visit is resumable if it was saved. This reads
  // localStorage/the URL, which must happen after mount to stay SSR-safe.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAvailable(Boolean(loadSaved()));
    setInitialMatchup(readChallengeFromUrl());
  }, []);

  // Keep the active debate saved as it progresses.
  useEffect(() => {
    if (!caseConfig) return;
    persist({ caseConfig, transcript, phaseIndex, verdict });
  }, [caseConfig, transcript, phaseIndex, verdict]);

  function recordFinishedDebate(c: CaseConfig, v: Verdict) {
    recordResult(v.winner === "user");
    addHistoryEntry({
      sport: c.sport,
      userAthlete: c.userAthlete,
      aiAthlete: c.aiAthlete,
      winner: v.winner,
      userTotal: totalScore(v, "user"),
      aiTotal: totalScore(v, "ai"),
      mode: c.mode,
    });
  }

  function resumeSaved() {
    const saved = loadSaved();
    if (!saved) return;
    setCaseConfig(saved.caseConfig);
    setTranscript(saved.transcript);
    setPhaseIndex(saved.phaseIndex);
    setVerdict(saved.verdict);
    setSavedAvailable(false);
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

      const withAi: TranscriptEntry[] = [
        ...t,
        { phase: p, speaker: "ai", athlete: c.aiAthlete, text: full.trim() },
      ];
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
      setError(
        err instanceof Error && err.message
          ? err.message
          : "The AI debater failed to respond. Check your connection and retry.",
      );
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
      if (!res.ok || !data?.verdict) {
        throw new Error(data?.error ?? "The judge failed to reach a verdict.");
      }
      const v = data.verdict as Verdict;
      setVerdict(v);
      recordFinishedDebate(c, v);
    } catch (err) {
      console.error(err);
      setFailedStage("judge");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "The judge failed to reach a verdict. Retry the deliberation.",
      );
    } finally {
      setJudging(false);
    }
  }

  function submitArgument(text: string) {
    if (!caseConfig) return;

    if (caseConfig.mode === "friend") {
      // Both sides are typed by humans passing the same device; no AI call for arguments.
      const entriesThisPhase = transcript.filter((t) => t.phase === phase).length;
      const speaker: "user" | "ai" = entriesThisPhase === 0 ? "user" : "ai";
      const athlete = speaker === "user" ? caseConfig.userAthlete : caseConfig.aiAthlete;
      const updated: TranscriptEntry[] = [...transcript, { phase, speaker, athlete, text }];
      setTranscript(updated);
      if (speaker === "ai") {
        const pIndex = PHASES.indexOf(phase);
        if (pIndex === PHASES.length - 1) {
          void runJudge(caseConfig, updated);
        } else {
          setPhaseIndex(pIndex + 1);
        }
      }
      return;
    }

    const withUser: TranscriptEntry[] = [
      ...transcript,
      { phase, speaker: "user", athlete: caseConfig.userAthlete, text },
    ];
    setTranscript(withUser);
    void runCounsel(caseConfig, withUser, phase);
  }

  function retry() {
    if (!caseConfig) return;
    if (failedStage === "judge") {
      void runJudge(caseConfig, transcript);
    } else {
      void runCounsel(caseConfig, transcript, phase);
    }
  }

  function resetTrial() {
    setTranscript([]);
    setPhaseIndex(0);
    setAiDraft("");
    setAiStreaming(false);
    setJudging(false);
    setVerdict(null);
    setError(null);
    setFailedStage(null);
  }

  function newCase() {
    resetTrial();
    setCaseConfig(null);
    persist(null);
    setSavedAvailable(false);
  }

  function backToSetup() {
    // Progress is already auto-saved, so this just parks the debate for later.
    setCaseConfig(null);
    setSavedAvailable(true);
  }

  if (tournamentOpen) {
    return <TournamentMode live={live} onExit={() => setTournamentOpen(false)} />;
  }

  if (!caseConfig) {
    return (
      <CaseSetup
        live={live}
        savedAvailable={savedAvailable}
        initialMatchup={initialMatchup}
        onStart={setCaseConfig}
        onResume={resumeSaved}
        onEnterTournament={() => setTournamentOpen(true)}
      />
    );
  }

  if (verdict) {
    return (
      <VerdictScene
        caseConfig={caseConfig}
        verdict={verdict}
        live={live}
        onRematch={resetTrial}
        onNewCase={newCase}
      />
    );
  }

  return (
    <Courtroom
      caseConfig={caseConfig}
      transcript={transcript}
      phase={phase}
      aiDraft={aiDraft}
      aiStreaming={aiStreaming}
      judging={judging}
      error={error}
      live={live}
      onSubmit={submitArgument}
      onRetry={retry}
      onBack={backToSetup}
    />
  );
}
