import Anthropic from "@anthropic-ai/sdk";
import { judgeSystem, judgeUserMessage, MODEL, VERDICT_SCHEMA } from "@/lib/prompts";
import { demoVerdict } from "@/lib/demo";
import type { CaseConfig, TranscriptEntry, Verdict } from "@/lib/types";

export const runtime = "nodejs";

interface JudgeRequest {
  caseConfig: CaseConfig;
  transcript: TranscriptEntry[];
}

function isValid(body: unknown): body is JudgeRequest {
  const b = body as JudgeRequest;
  return (
    !!b &&
    typeof b.caseConfig?.sport === "string" &&
    typeof b.caseConfig?.userAthlete === "string" &&
    typeof b.caseConfig?.aiAthlete === "string" &&
    Array.isArray(b.transcript) &&
    b.transcript.length > 0
  );
}

function parseVerdict(text: string): Verdict | null {
  try {
    const v = JSON.parse(text) as Verdict;
    if (
      (v.winner === "user" || v.winner === "ai") &&
      Array.isArray(v.scores) &&
      v.scores.length === 3 &&
      typeof v.opinion === "string" &&
      typeof v.bestLine === "string"
    ) {
      return v;
    }
  } catch {
    // fall through
  }
  return null;
}

async function requestVerdict(
  client: Anthropic,
  caseConfig: CaseConfig,
  transcript: TranscriptEntry[],
): Promise<Verdict | null> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: judgeSystem(caseConfig),
    output_config: { format: { type: "json_schema", schema: VERDICT_SCHEMA } },
    messages: [{ role: "user", content: judgeUserMessage(caseConfig, transcript) }],
  });
  if (response.stop_reason === "refusal") return null;
  const text = response.content.find((b) => b.type === "text")?.text;
  return text ? parseVerdict(text) : null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return Response.json({ error: "Missing case or transcript." }, { status: 400 });
  }
  const { caseConfig, transcript } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ verdict: demoVerdict(caseConfig, transcript), mode: "demo" });
  }

  const client = new Anthropic();
  try {
    // One retry on a malformed verdict before falling back to the demo judge.
    const verdict =
      (await requestVerdict(client, caseConfig, transcript)) ??
      (await requestVerdict(client, caseConfig, transcript));
    if (verdict) return Response.json({ verdict, mode: "live" });
    return Response.json({ verdict: demoVerdict(caseConfig, transcript), mode: "demo" });
  } catch (err) {
    console.error("judge error:", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "The judge rejected the court's credentials — check ANTHROPIC_API_KEY in .env.local." },
        { status: 500 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "The judge is hearing too many cases at once — wait a moment and retry." },
        { status: 429 },
      );
    }
    return Response.json(
      { error: "The judge failed to reach a verdict. Retry the deliberation." },
      { status: 500 },
    );
  }
}
