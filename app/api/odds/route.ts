import Groq from "groq-sdk";
import {
  oddsSystem,
  oddsUserMessage,
  verifiedOddsSystem,
  verifiedOddsUserMessage,
  MODEL,
  VERIFY_MODEL,
} from "@/lib/prompts";
import { demoOdds } from "@/lib/demo";
import { isKnownAthlete } from "@/lib/matchups";

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

interface VerifiedOddsResult extends OddsResult {
  verified: boolean;
}

function parseVerifiedOdds(text: string): VerifiedOddsResult | null {
  try {
    const v = JSON.parse(text) as VerifiedOddsResult;
    if (
      typeof v.verified === "boolean" &&
      typeof v.aPct === "number" &&
      typeof v.bPct === "number" &&
      typeof v.blurb === "string"
    ) {
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

  // Either player is a hand-typed name outside our curated roster: verify
  // they're real before showing any odds, using a web-search-capable model,
  // instead of letting the fast model confidently invent a percentage split.
  if (!isKnownAthlete(a) || !isKnownAthlete(b)) {
    try {
      const response = await client.chat.completions.create({
        model: VERIFY_MODEL,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: verifiedOddsSystem() },
          { role: "user", content: verifiedOddsUserMessage(sport, a, b) },
        ],
      });
      const text = response.choices[0]?.message?.content;
      const result = text ? parseVerifiedOdds(text) : null;
      if (result && !result.verified) {
        return Response.json({
          odds: { aPct: result.aPct, bPct: result.bPct, blurb: result.blurb },
          mode: "unverified",
        });
      }
      if (result) return Response.json({ odds: result, mode: "live" });
    } catch (err) {
      console.error("odds verification error:", err);
      // fall through to the demo estimate below
    }
    return Response.json({ odds: demoOdds(a, b), mode: "demo" });
  }

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
