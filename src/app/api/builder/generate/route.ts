import { buildPromptGenerationPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { intake, refinedIntent } = (await request.json()) as {
      intake: BuilderIntake;
      refinedIntent: Record<string, unknown>;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new Anthropic({ apiKey });
    const { system, user } = buildPromptGenerationPrompt(intake, refinedIntent);

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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
  } catch (error) {
    console.error("Builder generate error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate prompt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
