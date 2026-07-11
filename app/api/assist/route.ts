import Groq from "groq-sdk";
import {
  coachSystem,
  coachUserMessage,
  hintSystem,
  hintUserMessage,
  MODEL,
} from "@/lib/prompts";
import { demoCoachTip, demoHint } from "@/lib/demo";
import type { CaseConfig, Phase, TranscriptEntry } from "@/lib/types";
import { PHASES } from "@/lib/types";

export const runtime = "nodejs";

interface AssistRequest {
  type: "coach" | "hint";
  caseConfig: CaseConfig;
  phase: Phase;
  transcript: TranscriptEntry[];
  draft?: string;
}

function isValid(body: unknown): body is AssistRequest {
  const b = body as AssistRequest;
  return (
    !!b &&
    (b.type === "coach" || b.type === "hint") &&
    typeof b.caseConfig?.sport === "string" &&
    typeof b.caseConfig?.userAthlete === "string" &&
    typeof b.caseConfig?.aiAthlete === "string" &&
    PHASES.includes(b.phase) &&
    Array.isArray(b.transcript)
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return Response.json({ error: "Missing case, phase, or transcript." }, { status: 400 });
  }
  const { type, caseConfig, phase, transcript, draft } = body;

  if (!process.env.GROQ_API_KEY) {
    const tip = type === "coach" ? demoCoachTip() : demoHint(caseConfig.userAthlete);
    return Response.json({ tip, mode: "demo" });
  }

  const client = new Groq();
  try {
    const system = type === "coach" ? coachSystem() : hintSystem();
    const user =
      type === "coach"
        ? coachUserMessage(caseConfig, phase, draft?.trim() || "(nothing written yet)")
        : hintUserMessage(caseConfig, transcript, phase);

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 150,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const tip = response.choices[0]?.message?.content?.trim();
    if (tip) return Response.json({ tip, mode: "live" });
    const fallback = type === "coach" ? demoCoachTip() : demoHint(caseConfig.userAthlete);
    return Response.json({ tip: fallback, mode: "demo" });
  } catch (err) {
    console.error("assist error:", err);
    return Response.json(
      { error: "Couldn't get a tip right now. Try again in a moment." },
      { status: 500 },
    );
  }
}
