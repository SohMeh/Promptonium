"use client";

import { cn } from "@/lib/utils";
import type { BuilderStep } from "@/lib/builder/state";
import { Check, Circle, Loader2 } from "lucide-react";

const STEPS: { key: BuilderStep; label: string; shortLabel: string }[] = [
  { key: "intake", label: "Describe Your Prompt", shortLabel: "Describe" },
  { key: "clarify", label: "Clarify Intent", shortLabel: "Clarify" },
  { key: "generate", label: "Generate Prompt", shortLabel: "Generate" },
  { key: "evaluate", label: "Evaluate Quality", shortLabel: "Evaluate" },
  { key: "improve", label: "Review & Improve", shortLabel: "Improve" },
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
    <>
      {/* Mobile: compact horizontal step indicator */}
      <div className="lg:hidden border-b bg-muted/30 px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STEPS.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = index < currentIndex;
            return (
              <button
                key={step.key}
                onClick={() => isCompleted && onStepClick(step.key)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors",
                  isActive && "bg-primary/10 text-primary font-medium",
                  isCompleted && "text-foreground hover:bg-muted",
                  !isActive && !isCompleted && "text-muted-foreground/50"
                )}
              >
                {isActive && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isCompleted ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Circle className={cn("h-3 w-3", isActive ? "text-primary" : "text-muted-foreground/40")} />
                )}
                {step.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: full sidebar */}
      <nav className="w-64 border-r bg-muted/30 p-6 hidden lg:block shrink-0">
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
    </>
  );
}
