export interface Matchup {
  sport: string;
  a: string;
  b: string;
}

export type DebateStyle = "balanced" | "chill" | "ruthless" | "stats";
export type DebateMode = "ai" | "friend";
export type JudgeStyle = "strict" | "generous" | "statistical";

export const STYLES: { value: DebateStyle; label: string; blurb: string }[] = [
  { value: "balanced", label: "Balanced", blurb: "Confident, fair, hyped" },
  { value: "chill", label: "Chill", blurb: "Laid-back, friendly" },
  { value: "ruthless", label: "Ruthless", blurb: "No mercy on the argument" },
  { value: "stats", label: "Stats Nerd", blurb: "Numbers over everything" },
];

export const JUDGE_STYLES: { value: JudgeStyle; label: string; blurb: string }[] = [
  { value: "strict", label: "Strict", blurb: "Tough grader, high bar" },
  { value: "generous", label: "Generous", blurb: "Rewards effort and heart" },
  { value: "statistical", label: "Statistical", blurb: "Cares only about the numbers" },
];

export interface CaseConfig {
  sport: string;
  userAthlete: string;
  aiAthlete: string;
  style: DebateStyle;
  mode: DebateMode;
  judgeStyle: JudgeStyle;
}

export type Phase = "opening" | "rebuttal" | "closing";

export const PHASES: Phase[] = ["opening", "rebuttal", "closing"];

export const PHASE_LABELS: Record<Phase, string> = {
  opening: "Make Your Case",
  rebuttal: "Clap Back",
  closing: "Bring It Home",
};

export type Side = "user" | "ai";

export interface TranscriptEntry {
  phase: Phase;
  speaker: Side;
  athlete: string;
  text: string;
}

export interface RoundScore {
  phase: string;
  user: number;
  ai: number;
  note: string;
}

export interface Verdict {
  winner: Side;
  scores: RoundScore[];
  opinion: string;
  bestLine: string;
}

export function totalScore(verdict: Verdict, side: Side): number {
  return verdict.scores.reduce((sum, s) => sum + s[side], 0);
}
