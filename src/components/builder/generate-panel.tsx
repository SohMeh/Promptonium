"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GeneratePanelProps {
  streamingContent: string;
  isLoading: boolean;
}

export function GeneratePanel({ streamingContent, isLoading }: GeneratePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Generating Your Prompt</h2>
        <p className="text-sm text-muted-foreground">
          Crafting an optimized prompt based on your requirements.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generated Prompt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 rounded-md p-4 min-h-[200px]">
            {streamingContent || (isLoading ? "Starting generation..." : "")}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
