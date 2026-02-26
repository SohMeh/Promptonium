"use client";

import { useState, useMemo } from "react";
import type { PromptVersion } from "@/lib/types/prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VersionDiffProps {
  versions: PromptVersion[];
}

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

function computeDiff(leftText: string, rightText: string): DiffLine[] {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");
  const result: DiffLine[] = [];

  const maxLen = Math.max(leftLines.length, rightLines.length);
  for (let i = 0; i < maxLen; i++) {
    const leftLine = i < leftLines.length ? leftLines[i] : undefined;
    const rightLine = i < rightLines.length ? rightLines[i] : undefined;

    if (leftLine === rightLine) {
      result.push({ type: "same", text: leftLine ?? "" });
    } else {
      if (leftLine !== undefined) {
        result.push({ type: "removed", text: leftLine });
      }
      if (rightLine !== undefined) {
        result.push({ type: "added", text: rightLine });
      }
    }
  }

  return result;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function VersionDiff({ versions }: VersionDiffProps) {
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(
    versions.length > 1 ? versions.length - 1 : 0
  );

  const diff = useMemo(() => {
    const leftText = versions[leftIdx]?.content.raw ?? "";
    const rightText = versions[rightIdx]?.content.raw ?? "";
    return computeDiff(leftText, rightText);
  }, [versions, leftIdx, rightIdx]);

  if (versions.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Version Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Left:</span>
            <Select
              value={String(leftIdx)}
              onValueChange={(val) => setLeftIdx(Number(val))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Left version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v, i) => (
                  <SelectItem key={v.id} value={String(i)}>
                    v{i + 1} - {formatDate(v.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Right:</span>
            <Select
              value={String(rightIdx)}
              onValueChange={(val) => setRightIdx(Number(val))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Right version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v, i) => (
                  <SelectItem key={v.id} value={String(i)}>
                    v{i + 1} - {formatDate(v.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-2 text-xs font-medium text-muted-foreground border-b">
            <div className="px-3 py-2 border-r bg-muted/30">
              v{leftIdx + 1} - {formatDate(versions[leftIdx].createdAt)}
            </div>
            <div className="px-3 py-2 bg-muted/30">
              v{rightIdx + 1} - {formatDate(versions[rightIdx].createdAt)}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto font-mono text-sm">
            {diff.map((line, i) => {
              if (line.type === "same") {
                return (
                  <div key={i} className="grid grid-cols-2">
                    <div className="px-3 py-0.5 border-r whitespace-pre-wrap break-all">
                      {line.text}
                    </div>
                    <div className="px-3 py-0.5 whitespace-pre-wrap break-all">
                      {line.text}
                    </div>
                  </div>
                );
              }
              if (line.type === "removed") {
                return (
                  <div key={i} className="grid grid-cols-2">
                    <div className="px-3 py-0.5 border-r bg-red-500/10 text-red-700 dark:text-red-400 whitespace-pre-wrap break-all">
                      {line.text}
                    </div>
                    <div className="px-3 py-0.5" />
                  </div>
                );
              }
              // added
              return (
                <div key={i} className="grid grid-cols-2">
                  <div className="px-3 py-0.5 border-r" />
                  <div className="px-3 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 whitespace-pre-wrap break-all">
                    {line.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
