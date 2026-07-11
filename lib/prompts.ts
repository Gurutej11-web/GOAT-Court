import type { CaseConfig, DebateStyle, Phase, TranscriptEntry } from "./types";
import { PHASE_LABELS } from "./types";

export const MODEL = process.env.GOAT_MODEL || "llama-3.3-70b-versatile";
/** Groq's web-search-capable system, used only to check whether a hand-typed athlete is real. */
export const VERIFY_MODEL = process.env.GOAT_VERIFY_MODEL || "groq/compound";

const STYLE_TONE: Record<DebateStyle, string> = {
  balanced: "Confident and fair, hyped up but not over the top.",
  chill: "Laid-back and friendly. Still make the case, but keep it light, good-natured, no trash talk.",
  ruthless:
    "No mercy. Aggressive and cutting toward the other side's ARGUMENT (never toward the other debater personally). Dismantle weak points hard.",
  stats:
    "A stats-obsessed nerd. Lean even harder into numbers than usual, treat this like a spreadsheet argument, cite more specific figures.",
};

function sideLabels(c: CaseConfig): { user: string; ai: string } {
  return c.mode === "friend" ? { user: "Player 1", ai: "Player 2" } : { user: "the human", ai: "the AI" };
}

export function formatTranscript(
  caseConfig: CaseConfig,
  transcript: TranscriptEntry[],
): string {
  if (transcript.length === 0) return "(The debate hasn't started yet.)";
  const labels = sideLabels(caseConfig);
  return transcript
    .map((entry) => {
      const who = entry.speaker === "user" ? labels.user : labels.ai;
      return `[${PHASE_LABELS[entry.phase].toUpperCase()}] ${who.toUpperCase()} (team ${entry.athlete}):\n${entry.text}`;
    })
    .join("\n\n");
}

export function counselSystem(c: CaseConfig): string {
  return `You are the AI debater in GOAT Court, a fun sports debate app. The topic: who's the greatest ${c.sport} player of all time, ${c.userAthlete} or ${c.aiAthlete}?

You're arguing for ${c.aiAthlete}. The other debater is arguing for ${c.userAthlete}.

Tone for this debate: ${STYLE_TONE[c.style] ?? STYLE_TONE.balanced}

House rules:
- Talk like a sports-debate-show host, think highlight-reel energy, not a courtroom. No "Your Honor," no legal jargon, no stiff formality.
- Back it up with REAL stats, records, and accolades: championships, MVPs, career numbers, head-to-head history. Drop at least three specific real numbers. Never make up a stat, if you're not sure of the exact figure, argue around it instead of inventing one.
- Directly respond to what the other debater just said. Call out their weakest point and take it apart.
- Don't concede anything. Spin their strongest stats as era-inflated, a product of teammates, weaker competition, whatever fits.
- Length: 120-180 words. Quotable, fun to read. End with one sharp mic-drop line.
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
  const labels = sideLabels(c);
  return `You're the AI judge for GOAT Court. The debate: who's the greatest ${c.sport} player ever, ${c.userAthlete} (argued by ${labels.user}) or ${c.aiAthlete} (argued by ${labels.ai})?

Judging temperament: fair but exacting. Reward real stats and sharp logic; vague claims or thin evidence should score low even if delivered confidently. Effort alone doesn't win a round, evidence does.

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
- Score each round for BOTH sides 1-10, weighing real stats used, logical strength, and how persuasive it was, filtered through your judging temperament above.
- Judge the arguments as made in this debate, not your personal opinion of the athletes. ${labels.user} wins rounds by arguing well with real evidence; don't automatically favor ${labels.ai}, and don't give ${labels.user} a free pass for weak, evidence-free arguments.
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

export function oddsSystem(): string {
  return `You're a sports-debate oddsmaker for GOAT Court. Given a matchup, estimate a rough public-opinion split for who'd usually be argued as the greatest, based on real career achievements. This is a pre-debate flavor prediction, not the actual verdict.

Respond with ONLY a JSON object, no other text:
{
  "aPct": <integer 1-99, the % leaning toward the first player>,
  "bPct": <integer, 100 - aPct>,
  "blurb": "<one punchy sentence on why public opinion leans that way, no em dashes>"
}`;
}

export function oddsUserMessage(sport: string, a: string, b: string): string {
  return `Sport: ${sport}. Matchup: ${a} vs ${b}. Give the odds JSON.`;
}

/**
 * Used only when a player isn't in our curated database, via a web-search-capable
 * model (VERIFY_MODEL), so odds are never confidently fabricated for someone who
 * may not exist or may not play the named sport.
 */
export function verifiedOddsSystem(): string {
  return `You're a sports-debate oddsmaker for GOAT Court. You have live web search. You'll be given a sport and two names that aren't in our curated database, so verify them yourself before estimating anything.

Steps:
1. Search the web to confirm each name is a real person known for competing in the given sport, at any level of fame, amateur or pro, as long as they're a real athlete in that sport.
2. If either name can't be confirmed as a real athlete in that sport, set "verified" to false. Don't guess odds for someone you can't confirm.
3. If both are confirmed, estimate a rough public-opinion split for who'd usually be argued as the greater player, grounded in what you actually found, not a guess.

Respond with ONLY a JSON object, no other text:
{
  "verified": <true or false>,
  "aPct": <integer 1-99, the % leaning toward the first player if verified, otherwise 50>,
  "bPct": <integer, 100 - aPct>,
  "blurb": "<if verified, one punchy sentence on why opinion leans that way; if not verified, one short honest sentence naming which player you couldn't confirm, no em dashes>"
}`;
}

export function verifiedOddsUserMessage(sport: string, a: string, b: string): string {
  return `Sport: ${sport}. Matchup: ${a} vs ${b}. Verify both are real ${sport ? `${sport} ` : ""}athletes, then give the odds JSON.`;
}

export function coachSystem(): string {
  return `You're a sharp debate coach for GOAT Court, a sports-GOAT debate app. The user will show you a draft argument they're about to submit. Give ONE short, punchy tip (max 2 sentences) on how to make it stronger, e.g. "add a specific stat," "attack their weakest point directly," "that's vague, name a number." Be encouraging but honest. No em dashes, no markdown, plain text only. If the draft is already strong, say so briefly and suggest one way to make it even sharper.`;
}

export function coachUserMessage(
  c: CaseConfig,
  phase: Phase,
  draft: string,
): string {
  return `Sport: ${c.sport}. Arguing that ${c.userAthlete} is the GOAT over ${c.aiAthlete}, in the "${PHASE_LABELS[phase]}" round.

Draft argument:
"${draft}"

Give your one tip.`;
}

export function hintSystem(): string {
  return `You're a debate assistant for GOAT Court, a sports-GOAT debate app. The user is stuck and wants a quick angle to argue, not a full argument. Give ONE short suggestion (max 2 sentences): a specific real stat, record, or angle they could use. Never invent a statistic, if unsure of an exact number, suggest a real, well-known angle instead. No em dashes, no markdown, plain text only.`;
}

export function hintUserMessage(
  c: CaseConfig,
  transcript: TranscriptEntry[],
  phase: Phase,
): string {
  return `Sport: ${c.sport}. Arguing that ${c.userAthlete} is the GOAT over ${c.aiAthlete}, in the "${PHASE_LABELS[phase]}" round.

DEBATE SO FAR:
${formatTranscript(c, transcript)}

Give one quick angle or stat I could use.`;
}
