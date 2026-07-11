"use client";

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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="text-center">
        <svg
          viewBox="0 0 64 64"
          className="animate-gavel mx-auto h-16 w-16"
          aria-hidden="true"
        >
          <g transform="rotate(-40 30 26)">
            <rect x="14" y="20" width="32" height="12" rx="3" fill="#c9a227" />
            <rect x="12" y="18" width="6" height="16" rx="2" fill="#e6c258" />
            <rect x="42" y="18" width="6" height="16" rx="2" fill="#e6c258" />
            <rect x="28" y="32" width="5" height="22" rx="2.5" fill="#a03a34" />
          </g>
          <rect x="12" y="52" width="28" height="5" rx="2.5" fill="#c9a227" />
        </svg>
        <p className="mt-4 font-mono text-xs tracking-[0.35em] text-brass uppercase animate-rise">
          The court has reached a verdict{!live && " · demo mode"}
        </p>
        <h1
          className="mt-3 font-display text-4xl font-bold text-parchment sm:text-5xl animate-rise"
          style={{ animationDelay: "0.15s" }}
        >
          {winnerAthlete} <span className="text-brass">is the GOAT</span>
        </h1>
        <p
          className="mt-2 font-display italic text-parchment-dim animate-rise"
          style={{ animationDelay: "0.25s" }}
        >
          {userWon
            ? "Judgment entered for the human counsel. The machine has been out-lawyered."
            : "Judgment entered for the AI counsel. The court thanks you for a spirited defeat."}
        </p>
      </header>

      {/* Scorecard */}
      <section
        className="mt-8 overflow-hidden rounded-lg border border-line animate-rise"
        style={{ animationDelay: "0.35s" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel-2 font-mono text-[10px] tracking-[0.2em] uppercase">
                <th className="px-4 py-3 text-left text-parchment-dim">Round</th>
                <th className="px-3 py-3 text-center text-brass">
                  You · {caseConfig.userAthlete}
                </th>
                <th className="px-3 py-3 text-center text-crimson">
                  AI · {caseConfig.aiAthlete}
                </th>
              </tr>
            </thead>
            <tbody>
              {verdict.scores.map((s) => (
                <tr key={s.phase} className="border-b border-line/60 bg-panel">
                  <td className="px-4 py-3">
                    <p className="font-display font-bold text-parchment">{s.phase}</p>
                    <p className="mt-0.5 text-xs text-parchment-dim">{s.note}</p>
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-mono text-lg ${
                      s.user >= s.ai ? "text-brass-bright font-semibold" : "text-parchment-dim"
                    }`}
                  >
                    {s.user}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-mono text-lg ${
                      s.ai >= s.user ? "text-crimson font-semibold" : "text-parchment-dim"
                    }`}
                  >
                    {s.ai}
                  </td>
                </tr>
              ))}
              <tr className="bg-panel-2 font-mono">
                <td className="px-4 py-3 text-[11px] tracking-[0.2em] text-parchment-dim uppercase">
                  Total
                </td>
                <td
                  className={`px-3 py-3 text-center text-xl ${
                    userWon ? "text-brass-bright font-semibold" : "text-parchment-dim"
                  }`}
                >
                  {userTotal}
                </td>
                <td
                  className={`px-3 py-3 text-center text-xl ${
                    !userWon ? "text-crimson font-semibold" : "text-parchment-dim"
                  }`}
                >
                  {aiTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Judicial opinion */}
      <section
        className="mt-6 rounded-lg border border-brass/40 bg-panel p-5 animate-rise"
        style={{ animationDelay: "0.45s" }}
      >
        <h2 className="font-mono text-[11px] tracking-[0.25em] text-brass uppercase">
          Opinion of the court
        </h2>
        <p className="mt-3 whitespace-pre-wrap font-display leading-relaxed text-parchment">
          {verdict.opinion}
        </p>
        <blockquote className="mt-4 border-l-2 border-brass pl-4">
          <p className="font-display italic text-parchment-dim">
            &ldquo;{verdict.bestLine}&rdquo;
          </p>
          <cite className="mt-1 block font-mono text-[10px] tracking-wider text-parchment-dim/70 uppercase not-italic">
            — Line of the trial, as entered into the record
          </cite>
        </blockquote>
      </section>

      <div
        className="mt-8 flex flex-wrap justify-center gap-3 animate-rise"
        style={{ animationDelay: "0.55s" }}
      >
        <button
          onClick={onRematch}
          className="rounded-md border border-brass bg-brass px-6 py-2.5 font-display font-bold text-bench hover:bg-brass-bright transition-all cursor-pointer"
        >
          Appeal — retry this case
        </button>
        <button
          onClick={onNewCase}
          className="rounded-md border border-line bg-panel px-6 py-2.5 font-display font-bold text-parchment hover:border-brass/60 transition-all cursor-pointer"
        >
          File a new case
        </button>
      </div>
    </main>
  );
}
