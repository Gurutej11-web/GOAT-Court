"use client";

import { useEffect, useRef, useState } from "react";
import { imageFor } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
import TopBar from "@/components/TopBar";
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
  closing: "Bottom line: … (wrap it up, and say why your GOAT wins)",
};

const ROUND_SECONDS = 90;

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
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
  const [passGateOpen, setPassGateOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [assistTip, setAssistTip] = useState<string | null>(null);
  const [assistLoading, setAssistLoading] = useState<"coach" | "hint" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const isFriend = caseConfig.mode === "friend";
  const entriesThisPhase = transcript.filter((t) => t.phase === phase).length;
  const turnSpeaker: "user" | "ai" = entriesThisPhase === 0 ? "user" : "ai";
  const turnAthlete = turnSpeaker === "user" ? caseConfig.userAthlete : caseConfig.aiAthlete;
  const turnLabel = isFriend ? (turnSpeaker === "user" ? "Player 1" : "Player 2") : "You";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, aiDraft, judging]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onBack();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  // Cosmetic per-round timer; resets whenever the phase or whose turn it is changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsLeft(ROUND_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, entriesThisPhase]);

  // Feature-detect the Web Speech API; only exists client-side after mount.
  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(Boolean(Recognition));
  }, []);

  const busy = aiStreaming || judging;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const userImg = imageFor(caseConfig.sport, caseConfig.userAthlete);
  const aiImg = imageFor(caseConfig.sport, caseConfig.aiAthlete);

  function submit() {
    if (!draft.trim() || busy) return;
    onSubmit(draft.trim());
    setDraft("");
    setAssistTip(null);
    if (isFriend) setPassGateOpen(true);
  }

  async function requestAssist(type: "coach" | "hint") {
    if (assistLoading) return;
    setAssistLoading(type);
    setAssistTip(null);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, caseConfig, phase, transcript, draft }),
      });
      const data = await res.json().catch(() => null);
      setAssistTip(data?.tip ?? "Couldn't get a tip right now.");
    } catch {
      setAssistTip("Couldn't get a tip right now.");
    } finally {
      setAssistLoading(null);
    }
  }

  function toggleVoice() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const e = event as { results: ArrayLike<{ 0: { transcript: string } }> };
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + " ";
      setDraft((prev) => (prev ? prev.trim() + " " : "") + text.trim());
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerLow = secondsLeft <= 15 && secondsLeft > 0;

  return (
    <>
      <TopBar
        onHome={onBack}
        action={
          <button
            onClick={onBack}
            className="text-sm text-text-dim hover:text-text transition-colors cursor-pointer"
          >
            Save &amp; exit
          </button>
        }
      />
      <main className="animate-screen mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        {/* Header */}
        <header className="pb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <PlayerAvatar name={caseConfig.userAthlete} image={userImg} size={44} className="card-shadow" />
            <div>
              <h1 className="font-display text-xl font-bold text-text sm:text-2xl">
                {caseConfig.userAthlete} <span className="text-text-dim">vs</span>{" "}
                {caseConfig.aiAthlete}
              </h1>
              <p className="text-xs text-text-dim">
                Greatest {caseConfig.sport} player ever?{!live && !isFriend && " · demo mode"}
                {isFriend && " · playing with a friend"}
              </p>
            </div>
            <PlayerAvatar name={caseConfig.aiAthlete} image={aiImg} size={44} className="card-shadow" />
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
                      ? "border-accent bg-accent/15 text-accent"
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

          {transcript.map((entry, i) => {
            const label = isFriend
              ? entry.speaker === "user"
                ? "Player 1"
                : "Player 2"
              : entry.speaker === "user"
                ? "You"
                : "AI";
            return (
              <article
                key={i}
                className={`card-shadow animate-rise flex gap-3 rounded-xl border p-4 ${
                  entry.speaker === "user"
                    ? "border-accent/40 bg-surface"
                    : "border-neutral/40 bg-surface-2"
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
                      entry.speaker === "user" ? "text-accent" : "text-neutral"
                    }`}
                  >
                    {label} · {entry.athlete} · {PHASE_LABELS[entry.phase]}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed text-text">{entry.text}</p>
                </div>
              </article>
            );
          })}

          {/* Streaming AI argument (AI mode only) */}
          {aiStreaming && (
            <article className="card-shadow animate-rise flex gap-3 rounded-xl border border-neutral/40 bg-surface-2 p-4">
              <PlayerAvatar
                name={caseConfig.aiAthlete}
                image={aiImg}
                size={32}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral">
                  AI · {caseConfig.aiAthlete} · {PHASE_LABELS[phase]}
                </p>
                {aiDraft ? (
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed text-text">
                    {aiDraft}
                    <span className="ml-0.5 inline-block h-4 w-2 animate-pulse-soft bg-neutral align-middle" />
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="animate-pop inline-block rounded-full border-2 border-neutral px-2 py-0.5 text-xs font-bold tracking-wide text-neutral">
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
            <article className="card-shadow animate-rise rounded-xl border border-accent/50 bg-surface p-6 text-center">
              <span className="animate-trophy inline-block text-3xl">🏆</span>
              <p className="mt-2 text-text">The AI judge is tallying the scores…</p>
            </article>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="card-shadow mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral bg-surface-2 px-4 py-3"
          >
            <p className="text-sm text-text">
              <span className="font-bold text-text">Oops:</span> {error}
            </p>
            <button
              onClick={onRetry}
              className="rounded-lg border border-edge px-3 py-1 text-xs font-medium text-text hover:border-accent/50 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pass-the-device gate (friend mode only) */}
        {!judging && isFriend && passGateOpen && (
          <div className="card-shadow mt-4 rounded-xl border border-accent/40 bg-surface p-6 text-center">
            <p className="text-text">
              Pass the device to <span className="font-bold text-accent">{turnLabel}</span>
            </p>
            <p className="mt-1 text-sm text-text-dim">Arguing for {turnAthlete}</p>
            <button
              onClick={() => setPassGateOpen(false)}
              className="mt-3 rounded-lg bg-accent px-5 py-2 font-display font-bold text-accent-ink transition-all hover:bg-accent-bright cursor-pointer"
            >
              I&apos;m ready
            </button>
          </div>
        )}

        {/* Argument input */}
        {!judging && !(isFriend && passGateOpen) && (
          <section className="card-shadow mt-4 rounded-xl border border-edge bg-surface p-3">
            <div className="flex items-baseline justify-between">
              <label htmlFor="argument" className="text-xs font-semibold text-accent">
                {isFriend ? `${turnLabel} · ` : ""}
                {PHASE_LABELS[phase]}
              </label>
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <span className={timerLow ? "font-semibold text-neutral" : ""}>
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
                <span>
                  {words} {words === 1 ? "word" : "words"}
                </span>
              </div>
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
              className="mt-2 w-full resize-y rounded-lg border border-edge bg-page/60 px-3 py-2 leading-relaxed text-text placeholder:text-text-dim/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 transition-colors"
            />
            {assistTip && (
              <p className="mt-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-text">
                💡 {assistTip}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => requestAssist("coach")}
                  disabled={busy || assistLoading !== null || !draft.trim()}
                  className="rounded-lg border border-edge px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent/50 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {assistLoading === "coach" ? "Thinking…" : "Get feedback"}
                </button>
                <button
                  onClick={() => requestAssist("hint")}
                  disabled={busy || assistLoading !== null}
                  className="rounded-lg border border-edge px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent/50 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {assistLoading === "hint" ? "Thinking…" : "Need an angle?"}
                </button>
              </div>
              <p className="hidden text-xs text-text-dim/60 sm:block">⌘/Ctrl + Enter to send</p>
              <div className="ml-auto flex items-center gap-2">
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    disabled={busy}
                    aria-label="Dictate your argument"
                    className={`rounded-lg border px-3 py-2 transition-colors cursor-pointer ${
                      listening
                        ? "border-neutral bg-neutral/15 text-neutral"
                        : "border-edge text-text-dim hover:text-text"
                    }`}
                  >
                    {listening ? "⏹" : "🎤"}
                  </button>
                )}
                <button
                  onClick={submit}
                  disabled={!draft.trim() || busy}
                  className="rounded-lg bg-accent px-5 py-2 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 transition-all hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none cursor-pointer"
                >
                  {aiStreaming ? "AI is clapping back…" : "Send it"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
