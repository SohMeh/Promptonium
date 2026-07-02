"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { PromptContent } from "@/lib/types/prompt";

interface GeneratePanelProps {
  streamingContent: string;
  isLoading: boolean;
  generatedPrompt?: PromptContent | null;
  isEvaluating?: boolean;
}

export function GeneratePanel({ streamingContent, isLoading, generatedPrompt, isEvaluating }: GeneratePanelProps) {
  const displayContent = streamingContent || generatedPrompt?.raw || (isLoading ? "Starting generation..." : "");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {isEvaluating ? "Evaluating Your Prompt" : "Generating Your Prompt"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEvaluating
            ? "Analyzing your prompt across quality dimensions…"
            : "Crafting an optimized prompt based on your requirements."}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {(isLoading || isEvaluating) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : isEvaluating ? "Evaluating quality…" : "Generated Prompt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 rounded-md p-4 min-h-[200px]">
            {displayContent}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
