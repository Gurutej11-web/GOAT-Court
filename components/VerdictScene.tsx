"use client";

import { useState } from "react";
import { imageFor } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
import TopBar from "@/components/TopBar";
import { shareOrDownloadVerdictCard } from "@/lib/shareImage";
import { PHASE_LABELS } from "@/lib/types";
import type { CaseConfig, TranscriptEntry, Verdict } from "@/lib/types";
import { totalScore } from "@/lib/types";
import { buildChallengeUrl } from "@/lib/challenge";

interface Props {
  caseConfig: CaseConfig;
  verdict: Verdict;
  transcript: TranscriptEntry[];
  live: boolean;
  onRematch: () => void;
  onNewCase: () => void;
}

export default function VerdictScene({
  caseConfig,
  verdict,
  transcript,
  live,
  onRematch,
  onNewCase,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageState, setImageState] = useState<"idle" | "working" | "done">("idle");
  const userTotal = totalScore(verdict, "user");
  const aiTotal = totalScore(verdict, "ai");
  const userWon = verdict.winner === "user";
  const winnerAthlete = userWon ? caseConfig.userAthlete : caseConfig.aiAthlete;
  const winnerImg = imageFor(caseConfig.sport, winnerAthlete);

  async function copyResult() {
    const summary = `${caseConfig.userAthlete} vs ${caseConfig.aiAthlete}, greatest ${caseConfig.sport} player ever.\n${winnerAthlete} wins, ${userTotal}-${aiTotal}.\n"${verdict.bestLine}"\n\nDebate it yourself at GOAT Court.`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable, nothing to do
    }
  }

  async function copyReplayLink() {
    const url = buildChallengeUrl({
      sport: caseConfig.sport,
      a: caseConfig.userAthlete,
      b: caseConfig.aiAthlete,
    });
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard unavailable, nothing to do
    }
  }

  async function shareImage() {
    setImageState("working");
    await shareOrDownloadVerdictCard({
      winnerName: winnerAthlete,
      winnerImage: winnerImg,
      userAthlete: caseConfig.userAthlete,
      aiAthlete: caseConfig.aiAthlete,
      sport: caseConfig.sport,
      userTotal,
      aiTotal,
      bestLine: verdict.bestLine,
    });
    setImageState("done");
    setTimeout(() => setImageState("idle"), 2000);
  }

  function exportTranscript() {
    const lines: string[] = [
      `GOAT COURT — ${caseConfig.userAthlete} vs ${caseConfig.aiAthlete} (${caseConfig.sport})`,
      "",
      ...transcript.map((entry) => {
        const label = entry.speaker === "user" ? caseConfig.userAthlete : caseConfig.aiAthlete;
        return `[${PHASE_LABELS[entry.phase]}] ${label}:\n${entry.text}\n`;
      }),
      "— VERDICT —",
      `Winner: ${winnerAthlete} (${userTotal}-${aiTotal})`,
      "",
      verdict.opinion,
      "",
      `Best line: "${verdict.bestLine}"`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goat-court-${caseConfig.userAthlete}-vs-${caseConfig.aiAthlete}.txt`.replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TopBar onHome={onNewCase} />
      <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <header className="text-center">
          <div className="mx-auto w-fit">
            <PlayerAvatar
              name={winnerAthlete}
              image={winnerImg}
              size={88}
              className="card-shadow animate-trophy ring-4 ring-accent/30"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent animate-rise">
            And the verdict is in{!live && " · demo mode"}
          </p>
          <h1
            className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl animate-rise"
            style={{ animationDelay: "0.1s" }}
          >
            {winnerAthlete} <span className="text-accent">is the GOAT</span>
          </h1>
          <p className="mt-2 text-text-dim animate-rise" style={{ animationDelay: "0.2s" }}>
            {userWon
              ? "You out-argued the AI. Nicely done."
              : "The AI takes this one. Come back and run it again."}
          </p>
        </header>

        {/* Scorecard */}
        <section
          className="card-shadow mt-8 overflow-hidden rounded-xl border border-edge animate-rise"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge bg-surface-2 text-xs">
                  <th className="px-4 py-3 text-left font-medium text-text-dim">Round</th>
                  <th className="px-3 py-3 text-center font-medium text-accent">
                    You · {caseConfig.userAthlete}
                  </th>
                  <th className="px-3 py-3 text-center font-medium text-neutral">
                    AI · {caseConfig.aiAthlete}
                  </th>
                </tr>
              </thead>
              <tbody>
                {verdict.scores.map((s) => (
                  <tr key={s.phase} className="border-b border-edge/60 bg-surface">
                    <td className="px-4 py-3">
                      <p className="font-display font-bold text-text">{s.phase}</p>
                      <p className="mt-0.5 text-xs text-text-dim">{s.note}</p>
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-mono text-lg ${
                        s.user >= s.ai ? "text-accent font-semibold" : "text-text-dim"
                      }`}
                    >
                      {s.user}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-mono text-lg ${
                        s.ai >= s.user ? "text-neutral font-semibold" : "text-text-dim"
                      }`}
                    >
                      {s.ai}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-2">
                  <td className="px-4 py-3 text-xs font-medium text-text-dim">Total</td>
                  <td
                    className={`px-3 py-3 text-center font-mono text-xl ${
                      userWon ? "text-accent font-semibold" : "text-text-dim"
                    }`}
                  >
                    {userTotal}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-mono text-xl ${
                      !userWon ? "text-neutral font-semibold" : "text-text-dim"
                    }`}
                  >
                    {aiTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Verdict writeup */}
        <section
          className="card-shadow mt-6 rounded-xl border border-accent/30 bg-surface p-5 animate-rise"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
              Why {winnerAthlete} won
            </h2>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={copyResult}
                className="rounded-lg border border-edge px-2.5 py-1 text-xs text-text-dim hover:border-accent/50 hover:text-text transition-colors cursor-pointer"
              >
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                onClick={shareImage}
                disabled={imageState === "working"}
                className="rounded-lg border border-edge px-2.5 py-1 text-xs text-text-dim hover:border-accent/50 hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
              >
                {imageState === "working" ? "Making…" : imageState === "done" ? "Done!" : "Share image"}
              </button>
              <button
                onClick={exportTranscript}
                className="rounded-lg border border-edge px-2.5 py-1 text-xs text-text-dim hover:border-accent/50 hover:text-text transition-colors cursor-pointer"
              >
                Export transcript
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text">{verdict.opinion}</p>
          <blockquote className="mt-4 border-l-2 border-neutral pl-4">
            <p className="italic text-text-dim">&ldquo;{verdict.bestLine}&rdquo;</p>
            <cite className="mt-1 block text-xs text-text-dim/70 not-italic">
              Best line of the debate
            </cite>
          </blockquote>
        </section>

        <div
          className="mt-8 flex flex-wrap justify-center gap-3 animate-rise"
          style={{ animationDelay: "0.5s" }}
        >
          <button
            onClick={onRematch}
            className="rounded-xl bg-accent px-6 py-2.5 font-display font-bold text-accent-ink shadow-lg shadow-accent/20 hover:bg-accent-bright hover:scale-[1.02] transition-all cursor-pointer"
          >
            Run it back
          </button>
          <button
            onClick={onNewCase}
            className="rounded-xl border border-edge bg-surface px-6 py-2.5 font-display font-bold text-text hover:border-accent/50 transition-all cursor-pointer"
          >
            New matchup
          </button>
          <button
            onClick={copyReplayLink}
            className="rounded-xl border-2 border-accent bg-accent/10 px-6 py-2.5 font-display font-bold text-accent shadow-lg shadow-accent/10 transition-all hover:bg-accent/20 hover:scale-[1.02] cursor-pointer"
          >
            {linkCopied ? "Link copied!" : "Challenge a friend"}
          </button>
        </div>
        <p
          className="mt-3 text-center text-xs text-text-dim animate-rise"
          style={{ animationDelay: "0.6s" }}
        >
          Sends them this exact matchup so they can argue it out too.
        </p>
      </main>
    </>
  );
}
