"use client";

import { useEffect, useRef, useState } from "react";
import { imageFor } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
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
  onBack: () => void;
}

const PLACEHOLDERS: Record<Phase, string> = {
  opening: "My pick is the GOAT because… (bring your best stats and receipts)",
  rebuttal: "Nice try, but… (call out their weak point and defend your pick)",
  closing: "Bottom line: … (wrap it up — why does your GOAT win?)",
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
  onBack,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, aiDraft, judging]);

  const busy = aiStreaming || judging;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const userImg = imageFor(caseConfig.sport, caseConfig.userAthlete);
  const aiImg = imageFor(caseConfig.sport, caseConfig.aiAthlete);

  function submit() {
    if (!draft.trim() || busy) return;
    onSubmit(draft.trim());
    setDraft("");
  }

  return (
    <main className="animate-screen mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      {/* Header */}
      <header className="pb-4 text-center">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 text-sm text-text-dim hover:text-text transition-colors cursor-pointer"
        >
          ← Save &amp; exit
        </button>
        <div className="flex items-center justify-center gap-3">
          <PlayerAvatar name={caseConfig.userAthlete} image={userImg} size={44} />
          <div>
            <h1 className="font-display text-xl font-bold text-text sm:text-2xl">
              {caseConfig.userAthlete} <span className="text-text-dim">vs</span>{" "}
              {caseConfig.aiAthlete}
            </h1>
            <p className="text-xs text-text-dim">
              Greatest {caseConfig.sport} player ever?{!live && " · demo mode"}
            </p>
          </div>
          <PlayerAvatar name={caseConfig.aiAthlete} image={aiImg} size={44} />
        </div>
        {/* Phase tracker */}
        <ol className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
          {PHASES.map((p, i) => {
            const currentIndex = PHASES.indexOf(phase);
            const state = i < currentIndex ? "done" : i === currentIndex ? "now" : "todo";
            return (
              <li
                key={p}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium sm:text-xs ${
                  state === "now"
                    ? "border-violet bg-violet/15 text-violet-bright"
                    : state === "done"
                      ? "border-edge bg-surface text-text-dim line-through"
                      : "border-edge/60 text-text-dim/50"
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
        className="transcript-scroll mt-2 flex-1 space-y-4 overflow-y-auto pr-1"
        style={{ maxHeight: "48vh", minHeight: "200px" }}
        aria-live="polite"
      >
        {transcript.length === 0 && !aiStreaming && (
          <div className="rounded-xl border border-dashed border-edge bg-surface/40 p-6 text-center">
            <p className="text-text-dim">It&rsquo;s quiet in here… make the first move.</p>
          </div>
        )}

        {transcript.map((entry, i) => (
          <article
            key={i}
            className={`animate-rise flex gap-3 rounded-xl border p-4 ${
              entry.speaker === "user"
                ? "border-violet/40 bg-surface"
                : "border-cyan/40 bg-surface-2"
            }`}
          >
            <PlayerAvatar
              name={entry.athlete}
              image={imageFor(caseConfig.sport, entry.athlete)}
              size={32}
              className="mt-0.5"
            />
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  entry.speaker === "user" ? "text-violet-bright" : "text-cyan"
                }`}
              >
                {entry.speaker === "user" ? "You" : "AI"} · {entry.athlete} ·{" "}
                {PHASE_LABELS[entry.phase]}
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-text">{entry.text}</p>
            </div>
          </article>
        ))}

        {/* Streaming AI argument */}
        {aiStreaming && (
          <article className="animate-rise flex gap-3 rounded-xl border border-cyan/40 bg-surface-2 p-4">
            <PlayerAvatar
              name={caseConfig.aiAthlete}
              image={aiImg}
              size={32}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan">
                AI · {caseConfig.aiAthlete} · {PHASE_LABELS[phase]}
              </p>
              {aiDraft ? (
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-text">
                  {aiDraft}
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse-soft bg-cyan align-middle" />
                </p>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <span className="animate-pop inline-block rounded-full border-2 border-cyan px-2 py-0.5 text-xs font-bold tracking-wide text-cyan">
                    🔥 clapping back
                  </span>
                  <span className="animate-pulse-soft text-sm text-text-dim">thinking…</span>
                </div>
              )}
            </div>
          </article>
        )}

        {/* Judge deliberating */}
        {judging && (
          <article className="animate-rise rounded-xl border border-violet/50 bg-surface p-6 text-center">
            <span className="animate-trophy inline-block text-3xl">🏆</span>
            <p className="mt-2 text-text">The AI judge is tallying the scores…</p>
          </article>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan bg-cyan-deep/20 px-4 py-3"
        >
          <p className="text-sm text-text">
            <span className="font-bold text-cyan">Oops:</span> {error}
          </p>
          <button
            onClick={onRetry}
            className="rounded-lg border border-cyan px-3 py-1 text-xs font-medium text-text hover:bg-cyan/20 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Argument input */}
      {!judging && (
        <section className="mt-4 rounded-xl border border-edge bg-surface p-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="argument" className="text-xs font-semibold text-violet-bright">
              {PHASE_LABELS[phase]}
            </label>
            <span className="text-xs text-text-dim">
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
            className="mt-2 w-full resize-y rounded-lg border border-edge bg-ink/60 px-3 py-2 leading-relaxed text-text placeholder:text-text-dim/50 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/40 disabled:opacity-50 transition-colors"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="hidden text-xs text-text-dim/60 sm:block">⌘/Ctrl + Enter to send</p>
            <button
              onClick={submit}
              disabled={!draft.trim() || busy}
              className="ml-auto rounded-lg bg-gradient-to-r from-violet to-cyan px-5 py-2 font-display font-bold text-ink transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
            >
              {aiStreaming ? "AI is clapping back…" : "Send it"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
