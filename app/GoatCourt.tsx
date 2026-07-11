"use client";

import { useState } from "react";
import CaseSetup from "@/components/CaseSetup";
import Courtroom from "@/components/Courtroom";
import VerdictScene from "@/components/VerdictScene";
import type { CaseConfig, Phase, TranscriptEntry, Verdict } from "@/lib/types";
import { PHASES } from "@/lib/types";

type FailedStage = "counsel" | "judge" | null;

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

  const phase: Phase = PHASES[Math.min(phaseIndex, PHASES.length - 1)];

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
        throw new Error(detail?.error ?? "Opposing counsel failed to appear.");
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
      if (!full.trim()) throw new Error("Opposing counsel went silent mid-argument.");

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
          : "Opposing counsel failed to appear. Check your connection and retry.",
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
      setVerdict(data.verdict as Verdict);
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
  }

  if (!caseConfig) {
    return <CaseSetup live={live} onStart={setCaseConfig} />;
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
    />
  );
}
