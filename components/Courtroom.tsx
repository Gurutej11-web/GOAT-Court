"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseConfig, Phase, TranscriptEntry } from "@/lib/types";
import { PHASES, PHASE_LABELS } from "@/lib/types";

interface Props {
  caseConfig: CaseConfig;
  transcript: TranscriptEntry[];
  phase: Phase;
  aiDraft: string;
  aiStreaming: boolean;
  judging: boolean;
  error: string | null;
  live: boolean;
  onSubmit: (text: string) => void;
  onRetry: () => void;
}

const PLACEHOLDERS: Record<Phase, string> = {
  opening:
    "Your Honor, my client is the greatest because… (open with your strongest stats and records)",
  rebuttal:
    "Opposing counsel conveniently ignores… (attack their argument, defend your athlete)",
  closing:
    "When this court weighs the evidence… (bring it home — why does your athlete win?)",
};

export default function Courtroom({
  caseConfig,
  transcript,
  phase,
  aiDraft,
  aiStreaming,
  judging,
  error,
  live,
  onSubmit,
  onRetry,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, aiDraft, judging]);

  const busy = aiStreaming || judging;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  function submit() {
    if (!draft.trim() || busy) return;
    onSubmit(draft.trim());
    setDraft("");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      {/* Case caption */}
      <header className="border-b-2 border-brass/50 pb-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-brass uppercase">
          GOAT Court · Docket No. {new Date().getFullYear()}-GOAT
          {!live && " · demo mode"}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-parchment sm:text-3xl">
          {caseConfig.userAthlete} <span className="italic text-parchment-dim">v.</span>{" "}
          {caseConfig.aiAthlete}
        </h1>
        <p className="font-display text-sm italic text-parchment-dim">
          In the matter of the greatest {caseConfig.sport} player of all time
        </p>
        {/* Phase tracker */}
        <ol className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
          {PHASES.map((p, i) => {
            const currentIndex = PHASES.indexOf(phase);
            const state = i < currentIndex ? "done" : i === currentIndex ? "now" : "todo";
            return (
              <li
                key={p}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase sm:text-[11px] ${
                  state === "now"
                    ? "border-brass bg-brass/15 text-brass-bright"
                    : state === "done"
                      ? "border-line bg-panel text-parchment-dim line-through"
                      : "border-line/60 text-parchment-dim/50"
                }`}
              >
                {PHASE_LABELS[p]}
              </li>
            );
          })}
        </ol>
      </header>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="transcript-scroll mt-4 flex-1 space-y-4 overflow-y-auto pr-1"
        style={{ maxHeight: "48vh", minHeight: "200px" }}
        aria-live="polite"
      >
        {transcript.length === 0 && !aiStreaming && (
          <div className="rounded-lg border border-dashed border-line bg-panel/40 p-6 text-center">
            <p className="font-display italic text-parchment-dim">
              The courtroom falls silent. All eyes turn to you, counselor.
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-wider text-parchment-dim/60 uppercase">
              Deliver your opening statement below
            </p>
          </div>
        )}

        {transcript.map((entry, i) => (
          <article
            key={i}
            className={`animate-rise rounded-lg border p-4 ${
              entry.speaker === "user"
                ? "border-brass/40 bg-panel"
                : "border-crimson/40 bg-panel-2"
            }`}
          >
            <p
              className={`font-mono text-[10px] tracking-[0.2em] uppercase ${
                entry.speaker === "user" ? "text-brass" : "text-crimson"
              }`}
            >
              {entry.speaker === "user" ? "You" : "AI"} · Counsel for {entry.athlete} ·{" "}
              {PHASE_LABELS[entry.phase]}
            </p>
            <p className="mt-2 whitespace-pre-wrap font-display leading-relaxed text-parchment">
              {entry.text}
            </p>
          </article>
        ))}

        {/* Streaming AI argument */}
        {aiStreaming && (
          <article className="animate-rise rounded-lg border border-crimson/40 bg-panel-2 p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-crimson uppercase">
              AI · Counsel for {caseConfig.aiAthlete} · {PHASE_LABELS[phase]}
            </p>
            {aiDraft ? (
              <p className="mt-2 whitespace-pre-wrap font-display leading-relaxed text-parchment">
                {aiDraft}
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse-soft bg-crimson align-middle" />
              </p>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <span className="animate-objection inline-block rounded border-2 border-crimson px-2 py-0.5 font-display text-lg font-bold tracking-wide text-crimson">
                  OBJECTION!
                </span>
                <span className="animate-pulse-soft text-sm text-parchment-dim">
                  Opposing counsel rises to address the court…
                </span>
              </div>
            )}
          </article>
        )}

        {/* Judge deliberating */}
        {judging && (
          <article className="animate-rise rounded-lg border border-brass/50 bg-panel p-6 text-center">
            <span className="animate-gavel inline-block text-3xl">⚖️</span>
            <p className="mt-2 font-display italic text-parchment">
              The judge retires to chambers to weigh the evidence…
            </p>
            <p className="mt-1 animate-pulse-soft font-mono text-[11px] tracking-wider text-parchment-dim uppercase">
              Verdict imminent
            </p>
          </article>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-crimson bg-crimson-deep/30 px-4 py-3"
        >
          <p className="text-sm text-parchment">
            <span className="font-bold text-crimson">Mistrial averted:</span> {error}
          </p>
          <button
            onClick={onRetry}
            className="rounded border border-crimson px-3 py-1 font-mono text-xs tracking-wider text-parchment uppercase hover:bg-crimson/20 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Argument input */}
      {!judging && (
        <section className="mt-4 rounded-lg border border-line bg-panel p-3">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="argument"
              className="font-mono text-[11px] tracking-[0.2em] text-brass uppercase"
            >
              Your {PHASE_LABELS[phase]}
            </label>
            <span className="font-mono text-[10px] text-parchment-dim">
              {words} {words === 1 ? "word" : "words"}
            </span>
          </div>
          <textarea
            id="argument"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder={PLACEHOLDERS[phase]}
            rows={4}
            disabled={busy}
            className="mt-2 w-full resize-y rounded-md border border-line bg-bench/60 px-3 py-2 font-display leading-relaxed text-parchment placeholder:text-parchment-dim/50 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 disabled:opacity-50 transition-colors"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="hidden font-mono text-[10px] text-parchment-dim/60 uppercase tracking-wider sm:block">
              ⌘/Ctrl + Enter to submit
            </p>
            <button
              onClick={submit}
              disabled={!draft.trim() || busy}
              className="ml-auto rounded-md border border-brass bg-brass px-5 py-2 font-display font-bold text-bench transition-all hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
            >
              {aiStreaming ? "Counsel speaking…" : "Address the court"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
