import { buildPromptGenerationPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";
import { getProviderRegistry, getUserApiKey, isOpenModelRequest } from "@/lib/providers";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { intake, refinedIntent } = (await request.json()) as {
      intake: BuilderIntake;
      refinedIntent: Record<string, unknown>;
    };

    const { system, user } = buildPromptGenerationPrompt(intake, refinedIntent);

    if (isOpenModelRequest(request)) {
      return handleFreeModelGenerate(system, user);
    }

    // The user's own key takes priority; fall back to the server key,
    // then to the free provider so signed-in users always get output.
    const apiKey = getUserApiKey(request) ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return handleFreeModelGenerate(system, user);
    }

    return handleAnthropicStream(system, user, apiKey);
  } catch (error) {
    console.error("Builder generate error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate prompt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleAnthropicStream(system: string, user: string, apiKey: string) {
  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: user }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Free model: use non-streaming generate() then wrap the complete
 * response as a simulated SSE stream. More reliable than trying to
 * stream from the free API which can be flaky.
 */
async function handleFreeModelGenerate(system: string, user: string) {
  const registry = getProviderRegistry();
  const provider = registry.get("free");

  if (!provider) {
    return new Response(
      JSON.stringify({ error: "Free model provider not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Retry up to 3 times for the free model
  let result;
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result = await provider.generate(user, {
        systemPrompt: system,
        maxTokens: 4096,
      });
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Free model generate attempt ${attempt}/3 failed:`, lastError.message);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!result) {
    return new Response(
      JSON.stringify({ error: `Free model generation failed after 3 attempts: ${lastError?.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Wrap the complete response as SSE so the client stream reader works unchanged
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      // Send the full content in a small number of chunks for UI feedback
      const content = result.content;
      const chunkSize = 80;
      for (let i = 0; i < content.length; i += chunkSize) {
        const slice = content.slice(i, i + chunkSize);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: slice })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
