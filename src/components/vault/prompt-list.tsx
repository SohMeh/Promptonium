"use client";

import { useState, useMemo } from "react";
import type { PromptProject, ModelTarget } from "@/lib/types/prompt";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";

interface PromptListProps {
  projects: PromptProject[];
  onSelect: (project: PromptProject) => void;
  onDelete: (id: string) => void;
}

function getBestScore(project: PromptProject): number | null {
  const latestVersion = project.versions[project.versions.length - 1];
  if (!latestVersion?.evaluation) return null;
  return latestVersion.evaluation.totalScore;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
}

export function PromptList({ projects, onSelect, onDelete }: PromptListProps) {
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesModel =
        modelFilter === "all" || p.modelTarget === modelFilter;
      const matchesSource =
        sourceFilter === "all" || p.sourceMode === sourceFilter;
      return matchesSearch && matchesModel && matchesSource;
    });
  }, [projects, search, modelFilter, sourceFilter]);

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No saved prompts yet.</p>
            <p>Build one in the Prompt Builder!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="gpt">GPT</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="builder">Builder</SelectItem>
            <SelectItem value="arena">Arena</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              No prompts match your filters.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => {
            const score = getBestScore(project);
            return (
              <Card
                key={project.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => onSelect(project)}
              >
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {truncate(project.title, 50)}
                        </span>
                        <Badge variant="secondary" className="shrink-0">
                          {project.modelTarget}
                        </Badge>
                        <Badge variant="outline" className="shrink-0">
                          {project.sourceMode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(project.createdAt)}</span>
                        {project.tags.length > 0 && (
                          <>
                            <span>|</span>
                            <span>{project.tags.slice(0, 3).join(", ")}</span>
                          </>
                        )}
                        {score !== null && (
                          <>
                            <span>|</span>
                            <span className="font-medium text-foreground">
                              Score: {Math.round(score)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete "${project.title}"? This cannot be undone.`
                          )
                        ) {
                          onDelete(project.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
