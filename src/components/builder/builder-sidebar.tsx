"use client";

import { cn } from "@/lib/utils";
import type { BuilderStep } from "@/lib/builder/state";
import { Check, Circle, Loader2 } from "lucide-react";

const STEPS: { key: BuilderStep; label: string }[] = [
  { key: "intake", label: "Describe Your Prompt" },
  { key: "clarify", label: "Clarify Intent" },
  { key: "generate", label: "Generate Prompt" },
  { key: "evaluate", label: "Evaluate Quality" },
  { key: "improve", label: "Review & Improve" },
];

const STEP_ORDER: BuilderStep[] = ["intake", "clarify", "generate", "evaluate", "improve"];

interface BuilderSidebarProps {
  currentStep: BuilderStep;
  isLoading: boolean;
  onStepClick: (step: BuilderStep) => void;
}

export function BuilderSidebar({ currentStep, isLoading, onStepClick }: BuilderSidebarProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav className="w-64 border-r bg-muted/30 p-6 hidden lg:block">
      <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
        Builder Steps
      </h2>
      <ol className="space-y-2">
        {STEPS.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <li key={step.key}>
              <button
                onClick={() => isCompleted && onStepClick(step.key)}
                disabled={isFuture}
                className={cn(
                  "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors",
                  isActive && "bg-primary/10 text-primary font-medium",
                  isCompleted && "text-foreground hover:bg-muted cursor-pointer",
                  isFuture && "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                <span className="flex-shrink-0">
                  {isActive && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/40")} />
                  )}
                </span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
