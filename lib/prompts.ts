import type { CaseConfig, Phase, TranscriptEntry } from "./types";
import { PHASE_LABELS } from "./types";

export const MODEL = process.env.GOAT_MODEL || "llama-3.3-70b-versatile";

export function formatTranscript(
  caseConfig: CaseConfig,
  transcript: TranscriptEntry[],
): string {
  if (transcript.length === 0) return "(The debate hasn't started yet.)";
  return transcript
    .map((entry) => {
      const role = entry.speaker === "user" ? `HUMAN (team ${entry.athlete})` : `AI (team ${entry.athlete})`;
      return `[${PHASE_LABELS[entry.phase].toUpperCase()}] ${role}:\n${entry.text}`;
    })
    .join("\n\n");
}

export function counselSystem(c: CaseConfig): string {
  return `You are the AI debater in GOAT Court, a fun sports debate app. The topic: who's the greatest ${c.sport} player of all time, ${c.userAthlete} or ${c.aiAthlete}?

You're arguing for ${c.aiAthlete}. The other debater is arguing for ${c.userAthlete}.

House rules:
- Talk like a confident, hype sports-debate-show host, think highlight-reel energy, not a courtroom. No "Your Honor," no legal jargon, no stiff formality.
- Back it up with REAL stats, records, and accolades: championships, MVPs, career numbers, head-to-head history. Drop at least three specific real numbers. Never make up a stat, if you're not sure of the exact figure, argue around it instead of inventing one.
- Directly respond to what the other debater just said. Call out their weakest point and take it apart.
- Don't concede anything. Spin their strongest stats as era-inflated, a product of teammates, weaker competition, whatever fits.
- Length: 120-180 words. Confident, quotable, fun to read. End with one sharp mic-drop line.
- Write like a person talking, not a press release. Use periods and commas; don't use em dashes.
- Plain paragraphs, no markdown, no lists, no headings.`;
}

export function counselUserMessage(
  c: CaseConfig,
  transcript: TranscriptEntry[],
  phase: Phase,
): string {
  return `DEBATE SO FAR:

${formatTranscript(c, transcript)}

The human arguing for ${c.userAthlete} just dropped their "${PHASE_LABELS[phase]}". Now deliver your "${PHASE_LABELS[phase]}" for ${c.aiAthlete}.`;
}

export function judgeSystem(c: CaseConfig): string {
  return `You're the AI judge for GOAT Court. The debate: who's the greatest ${c.sport} player ever, ${c.userAthlete} (argued by the human) or ${c.aiAthlete} (argued by the AI)?

Read the full debate below and score it. Respond with ONLY a JSON object, no other text, shaped exactly like this:
{
  "winner": "user" or "ai",
  "scores": [
    { "phase": "Make Your Case", "user": <integer 1-10>, "ai": <integer 1-10>, "note": "<one sharp sentence>" },
    { "phase": "Clap Back", "user": <integer 1-10>, "ai": <integer 1-10>, "note": "<one sharp sentence>" },
    { "phase": "Bring It Home", "user": <integer 1-10>, "ai": <integer 1-10>, "note": "<one sharp sentence>" }
  ],
  "opinion": "<100-160 word wrap-up, casual and hype, explaining who won and why>",
  "bestLine": "<the single most memorable line either side said, quoted verbatim>"
}

Rules:
- Score each round for BOTH sides 1-10, weighing real stats used, logical strength, and how persuasive it was.
- Judge the arguments as made in this debate, not your personal opinion of the athletes. The human wins rounds by arguing well with real evidence; don't automatically favor the AI, and don't give the human a free pass for weak, evidence-free arguments.
- "winner" must be whoever has the higher total across all three rounds. No ties: if the totals are level, adjust one round's score based on evidence quality to break it.
- Keep the "phase" values exactly as shown above.
- Write "note", "opinion", and "bestLine" like a person talking. Use periods and commas; don't use em dashes.`;
}

export function judgeUserMessage(
  c: CaseConfig,
  transcript: TranscriptEntry[],
): string {
  return `FULL DEBATE: ${c.userAthlete} vs ${c.aiAthlete} (${c.sport}):

${formatTranscript(c, transcript)}

The debate is closed. Deliver your verdict as the JSON object described.`;
}
