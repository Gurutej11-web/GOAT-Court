import Anthropic from "@anthropic-ai/sdk";
import { counselSystem, counselUserMessage, MODEL } from "@/lib/prompts";
import { demoCounselArgument } from "@/lib/demo";
import type { CaseConfig, Phase, TranscriptEntry } from "@/lib/types";
import { PHASES } from "@/lib/types";

export const runtime = "nodejs";

interface CounselRequest {
  caseConfig: CaseConfig;
  transcript: TranscriptEntry[];
  phase: Phase;
}

function isValid(body: unknown): body is CounselRequest {
  const b = body as CounselRequest;
  return (
    !!b &&
    typeof b.caseConfig?.sport === "string" &&
    typeof b.caseConfig?.userAthlete === "string" &&
    typeof b.caseConfig?.aiAthlete === "string" &&
    Array.isArray(b.transcript) &&
    PHASES.includes(b.phase)
  );
}

const encoder = new TextEncoder();

/** Streams a canned argument word-by-word so demo mode still feels alive. */
function demoStream(text: string): Response {
  const words = text.split(" ");
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i]));
        await new Promise((r) => setTimeout(r, 24));
      }
      controller.close();
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Goat-Mode": "demo" },
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return Response.json({ error: "Missing case, transcript, or phase." }, { status: 400 });
  }
  const { caseConfig, transcript, phase } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return demoStream(demoCounselArgument(caseConfig, phase));
  }

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: counselSystem(caseConfig),
    messages: [{ role: "user", content: counselUserMessage(caseConfig, transcript, phase) }],
  });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("Your Honor, counsel declines to argue this matter. (The AI refused this request — try a different matchup.)"),
          );
        }
        controller.close();
      } catch (err) {
        console.error("counsel stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Goat-Mode": "live" },
  });
}
