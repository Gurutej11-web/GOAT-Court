export interface Matchup {
  sport: string;
  a: string;
  b: string;
}

export interface CaseConfig {
  sport: string;
  userAthlete: string;
  aiAthlete: string;
}

export type Phase = "opening" | "rebuttal" | "closing";

export const PHASES: Phase[] = ["opening", "rebuttal", "closing"];

export const PHASE_LABELS: Record<Phase, string> = {
  opening: "Opening Statements",
  rebuttal: "Rebuttal",
  closing: "Closing Arguments",
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
