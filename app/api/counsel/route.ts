import Groq from "groq-sdk";
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

  if (!process.env.GROQ_API_KEY) {
    return demoStream(demoCounselArgument(caseConfig, phase));
  }

  const client = new Groq();

  let stream: Awaited<ReturnType<typeof client.chat.completions.create>>;
  try {
    stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: counselSystem(caseConfig) },
        { role: "user", content: counselUserMessage(caseConfig, transcript, phase) },
      ],
    });
  } catch (err) {
    console.error("counsel request error:", err);
    return Response.json(
      { error: "The AI debater couldn't be reached. Check GROQ_API_KEY and retry." },
      { status: 500 },
    );
  }

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream as AsyncIterable<Groq.Chat.Completions.ChatCompletionChunk>) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
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
