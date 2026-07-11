import type { CaseConfig, Phase, TranscriptEntry } from "./types";
import { PHASE_LABELS } from "./types";

export const MODEL = process.env.GOAT_MODEL || "claude-opus-4-8";

export function formatTranscript(
  caseConfig: CaseConfig,
  transcript: TranscriptEntry[],
): string {
  if (transcript.length === 0) return "(The trial is just beginning.)";
  return transcript
    .map((entry) => {
      const role =
        entry.speaker === "user"
          ? `HUMAN COUNSEL for ${entry.athlete}`
          : `AI COUNSEL for ${entry.athlete}`;
      return `[${PHASE_LABELS[entry.phase].toUpperCase()}] ${role}:\n${entry.text}`;
    })
    .join("\n\n");
}

export function counselSystem(c: CaseConfig): string {
  return `You are the AI opposing counsel in GOAT Court, a theatrical courtroom where sports greatness is put on trial.

THE CASE: Who is the greatest ${c.sport} player of all time — ${c.userAthlete} or ${c.aiAthlete}?
You represent ${c.aiAthlete}. The human counsel represents ${c.userAthlete}.

Rules of the court:
- Stay fully in character as a dramatic, razor-sharp trial lawyer. Address "Your Honor" and "the court". Never break character, never mention being an AI.
- Build every argument on REAL, verifiable statistics, records, and accolades: championships, MVPs, career totals, records held, head-to-head history. Cite at least three specific real numbers in every argument. Never invent a statistic — if you are not certain of an exact figure, use accurate framing instead of a made-up number.
- Directly rebut the human counsel's most recent argument: seize on their weakest claim and dismantle it with evidence.
- Concede nothing. Reframe your opponent's strongest stats as products of era, competition level, longevity, or supporting cast.
- Length: 120–180 words. Punchy, quotable, devastating. End with a single-sentence sting.
- Write as spoken courtroom oratory in plain paragraphs. No markdown, no lists, no headings.`;
}

export function counselUserMessage(
  c: CaseConfig,
  transcript: TranscriptEntry[],
  phase: Phase,
): string {
  return `COURT TRANSCRIPT SO FAR:

${formatTranscript(c, transcript)}

The human counsel representing ${c.userAthlete} has just delivered their ${PHASE_LABELS[phase].toLowerCase()}. Deliver your ${PHASE_LABELS[phase].toLowerCase()} on behalf of ${c.aiAthlete} now.`;
}

export function judgeSystem(c: CaseConfig): string {
  return `You are the Honorable Judge presiding over GOAT Court, where the question before the bench is: who is the greatest ${c.sport} player of all time — ${c.userAthlete} (represented by human counsel) or ${c.aiAthlete} (represented by AI counsel)?

Read the full trial transcript and deliver a verdict:
- Score each round (Opening Statements, Rebuttal, Closing Arguments) for BOTH counsels on a 1–10 integer scale, weighing quality of evidence (real statistics and records), logical strength, and persuasive craft.
- Judge the arguments as made in this courtroom, not your own opinion of the athletes. The human counsel wins rounds when they argue well with concrete evidence; do not automatically favor the AI counsel, and do not hand the human a sympathy victory for weak, evidence-free arguments.
- "winner" must be the side with the higher total score across the three rounds (no ties — if totals are level, adjust one round score to break the tie based on evidence quality).
- Each round's "note" is one sharp sentence on why it was scored that way.
- "opinion" is your written judicial opinion: 100–160 words, grand and wry courtroom voice, naming the decisive evidence.
- "bestLine" quotes the single most memorable line uttered by either counsel during the trial.`;
}

export function judgeUserMessage(
  c: CaseConfig,
  transcript: TranscriptEntry[],
): string {
  return `FULL TRIAL TRANSCRIPT — ${c.userAthlete} v. ${c.aiAthlete} (${c.sport}):

${formatTranscript(c, transcript)}

The arguments are closed. Deliver your verdict.`;
}

/** JSON schema for the judge's structured verdict (strict: no numeric range constraints supported). */
export const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["winner", "scores", "opinion", "bestLine"],
  properties: {
    winner: { type: "string", enum: ["user", "ai"] },
    scores: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "user", "ai", "note"],
        properties: {
          phase: {
            type: "string",
            enum: ["Opening Statements", "Rebuttal", "Closing Arguments"],
          },
          user: { type: "integer" },
          ai: { type: "integer" },
          note: { type: "string" },
        },
      },
    },
    opinion: { type: "string" },
    bestLine: { type: "string" },
  },
} as const;
