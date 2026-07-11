"use client";

import { imageFor } from "@/lib/matchups";
import PlayerAvatar from "@/components/PlayerAvatar";
import type { CaseConfig, Verdict } from "@/lib/types";
import { totalScore } from "@/lib/types";

interface Props {
  caseConfig: CaseConfig;
  verdict: Verdict;
  live: boolean;
  onRematch: () => void;
  onNewCase: () => void;
}

export default function VerdictScene({
  caseConfig,
  verdict,
  live,
  onRematch,
  onNewCase,
}: Props) {
  const userTotal = totalScore(verdict, "user");
  const aiTotal = totalScore(verdict, "ai");
  const userWon = verdict.winner === "user";
  const winnerAthlete = userWon ? caseConfig.userAthlete : caseConfig.aiAthlete;
  const winnerImg = imageFor(caseConfig.sport, winnerAthlete);

  return (
    <main className="animate-screen mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <header className="text-center">
        <div className="mx-auto w-fit">
          <PlayerAvatar name={winnerAthlete} image={winnerImg} size={88} className="animate-trophy ring-4 ring-violet/30" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-cyan animate-rise">
          And the verdict is in{!live && " · demo mode"}
        </p>
        <h1
          className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl animate-rise"
          style={{ animationDelay: "0.1s" }}
        >
          {winnerAthlete}{" "}
          <span className="bg-gradient-to-r from-violet-bright to-cyan bg-clip-text text-transparent">
            is the GOAT
          </span>
        </h1>
        <p className="mt-2 text-text-dim animate-rise" style={{ animationDelay: "0.2s" }}>
          {userWon
            ? "You out-argued the AI. Nicely done."
            : "The AI takes this one — come back and run it again."}
        </p>
      </header>

      {/* Scorecard */}
      <section
        className="mt-8 overflow-hidden rounded-xl border border-edge animate-rise"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge bg-surface-2 text-xs">
                <th className="px-4 py-3 text-left font-medium text-text-dim">Round</th>
                <th className="px-3 py-3 text-center font-medium text-violet-bright">
                  You · {caseConfig.userAthlete}
                </th>
                <th className="px-3 py-3 text-center font-medium text-cyan">
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
                      s.user >= s.ai ? "text-violet-bright font-semibold" : "text-text-dim"
                    }`}
                  >
                    {s.user}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-mono text-lg ${
                      s.ai >= s.user ? "text-cyan font-semibold" : "text-text-dim"
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
                    userWon ? "text-violet-bright font-semibold" : "text-text-dim"
                  }`}
                >
                  {userTotal}
                </td>
                <td
                  className={`px-3 py-3 text-center font-mono text-xl ${
                    !userWon ? "text-cyan font-semibold" : "text-text-dim"
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
        className="mt-6 rounded-xl border border-violet/30 bg-surface p-5 animate-rise"
        style={{ animationDelay: "0.4s" }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-violet-bright">
          Why {winnerAthlete} won
        </h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text">{verdict.opinion}</p>
        <blockquote className="mt-4 border-l-2 border-cyan pl-4">
          <p className="italic text-text-dim">&ldquo;{verdict.bestLine}&rdquo;</p>
          <cite className="mt-1 block text-xs text-text-dim/70 not-italic">
            — best line of the debate
          </cite>
        </blockquote>
      </section>

      <div
        className="mt-8 flex flex-wrap justify-center gap-3 animate-rise"
        style={{ animationDelay: "0.5s" }}
      >
        <button
          onClick={onRematch}
          className="rounded-xl bg-gradient-to-r from-violet to-cyan px-6 py-2.5 font-display font-bold text-ink hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer"
        >
          Run it back
        </button>
        <button
          onClick={onNewCase}
          className="rounded-xl border border-edge bg-surface px-6 py-2.5 font-display font-bold text-text hover:border-violet/60 transition-all cursor-pointer"
        >
          New matchup
        </button>
      </div>
    </main>
  );
}
