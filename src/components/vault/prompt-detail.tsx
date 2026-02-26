"use client";

import { useState } from "react";
import type { PromptProject, PromptVersion } from "@/lib/types/prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Copy, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface PromptDetailProps {
  project: PromptProject;
  onBack: () => void;
  onDelete: (id: string) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

export function PromptDetail({
  project,
  onBack,
  onDelete,
}: PromptDetailProps) {
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(
    project.versions.length - 1
  );

  const selectedVersion: PromptVersion | undefined =
    project.versions[selectedVersionIdx];

  const handleCopy = async () => {
    if (!selectedVersion) return;
    try {
      await navigator.clipboard.writeText(selectedVersion.content.raw);
    } catch {
      // Fallback: silently fail if clipboard not available
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete "${project.title}"? This cannot be undone.`
      )
    ) {
      onDelete(project.id);
    }
  };

  const sections = selectedVersion
    ? [
        { label: "System Context", value: selectedVersion.content.systemContext },
        { label: "Task", value: selectedVersion.content.task },
        { label: "Constraints", value: selectedVersion.content.constraints },
        { label: "Output Format", value: selectedVersion.content.outputFormat },
        { label: "Examples", value: selectedVersion.content.examples },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{project.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Badge variant="secondary">{project.modelTarget}</Badge>
              <Badge variant="outline">{project.sourceMode}</Badge>
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/builder">
            <Button variant="outline" size="sm">
              <ExternalLink className="size-4 mr-1" />
              Open in Builder
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="size-4 mr-1" />
            Copy Prompt
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Version Selector */}
      {project.versions.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Version:</span>
          <Select
            value={String(selectedVersionIdx)}
            onValueChange={(val) => setSelectedVersionIdx(Number(val))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {project.versions.map((v, i) => (
                <SelectItem key={v.id} value={String(i)}>
                  v{i + 1} - {formatDate(v.createdAt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Evaluation Score */}
      {selectedVersion?.evaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Evaluation Score
              <Badge
                variant={getScoreBadgeVariant(
                  selectedVersion.evaluation.totalScore
                )}
                className="text-base px-3 py-1"
              >
                {Math.round(selectedVersion.evaluation.totalScore)} / 100
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Prompt Sections */}
      {sections.map((section) => (
        <Card key={section.label}>
          <CardHeader>
            <CardTitle className="text-base">{section.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {section.value ? (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg">
                {section.value}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No content for this section.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
