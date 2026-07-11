import Groq from "groq-sdk";
import { oddsSystem, oddsUserMessage, MODEL } from "@/lib/prompts";
import { demoOdds } from "@/lib/demo";

export const runtime = "nodejs";

interface OddsRequest {
  sport: string;
  a: string;
  b: string;
}

function isValid(body: unknown): body is OddsRequest {
  const b = body as OddsRequest;
  return !!b && typeof b.sport === "string" && typeof b.a === "string" && typeof b.b === "string";
}

interface OddsResult {
  aPct: number;
  bPct: number;
  blurb: string;
}

function parseOdds(text: string): OddsResult | null {
  try {
    const v = JSON.parse(text) as OddsResult;
    if (typeof v.aPct === "number" && typeof v.bPct === "number" && typeof v.blurb === "string") {
      return v;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return Response.json({ error: "Missing sport or players." }, { status: 400 });
  }
  const { sport, a, b } = body;

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ odds: demoOdds(a, b), mode: "demo" });
  }

  const client = new Groq();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: oddsSystem() },
        { role: "user", content: oddsUserMessage(sport, a, b) },
      ],
    });
    const text = response.choices[0]?.message?.content;
    const odds = text ? parseOdds(text) : null;
    if (odds) return Response.json({ odds, mode: "live" });
    return Response.json({ odds: demoOdds(a, b), mode: "demo" });
  } catch (err) {
    console.error("odds error:", err);
    return Response.json({ odds: demoOdds(a, b), mode: "demo" });
  }
}
