import { NextRequest } from "next/server";
import { streamText, convertToCoreMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing NEXT_PUBLIC_GOOGLE_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const msgs = Array.isArray(body?.messages) ? body.messages : undefined;
  const input = typeof body?.input === "string" ? body.input : typeof body?.prompt === "string" ? body.prompt : "";
  const system = typeof body?.system === "string" ? body.system : "";

  const messages = msgs
    ? convertToCoreMessages(msgs)
    : [
        system ? { role: "system", content: system } : undefined,
        input ? { role: "user", content: input } : undefined,
      ].filter(Boolean) as any;

  const model = google("gemini-2.5-flash-lite");
  const temperature = typeof body?.temperature === "number" ? body.temperature : 0.7;
  const maxTokens = typeof body?.maxTokens === "number" ? body.maxTokens : 1024;

  const result = await streamText({ model, messages });
  return result.toTextStreamResponse();
}