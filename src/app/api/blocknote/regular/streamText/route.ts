import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, tool, jsonSchema } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const { messages, toolDefinition, toolDefinitions } = await req.json().catch(() => ({}));

  const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const modelId = "gemini-2.5-flash-lite";

  const defs = toolDefinitions ?? toolDefinition;
  const toolsFromDefinitions = defs
    ? Object.fromEntries(
        Object.entries(defs).map(([name, def]: any) => [
          name,
          tool({
            name,
            description: def?.description,
            inputSchema: jsonSchema(def?.inputSchema),
            outputSchema: jsonSchema(def?.outputSchema),
          }),
        ])
      )
    : undefined;

  try {
    console.log("[blocknote-ai] request", {
      reqId,
      model: modelId,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
      tools: toolsFromDefinitions ? Object.keys(toolsFromDefinitions) : [],
    });
  } catch {}

  const toolNames = toolsFromDefinitions ? Object.keys(toolsFromDefinitions) : [];
  const result = streamText({
    model: google(modelId),
    messages: convertToModelMessages(messages ?? [], { ignoreIncompleteToolCalls: true }),
    tools: toolsFromDefinitions,
    toolChoice: toolsFromDefinitions ? "required" : "auto",
    activeTools: toolNames,
  });

  return result.toUIMessageStreamResponse();
}