# Phase 2: Builder Vertical Slice — Design

**Date:** 2026-02-19
**Status:** Approved

## Overview

Full end-to-end Builder mode: Intake -> Clarify -> Generate (streaming) -> Evaluate (hybrid rubric) -> Improve -> Save.

## Locked Decisions

| Decision | Choice |
|---|---|
| Streaming | Full streaming for all Claude responses |
| Flow UI | Sidebar steps + main content area |
| Eval strategy | Single batched LLM call for all judge dimensions |
| State management | useReducer on Builder page |

## Page Architecture

Sidebar (fixed left) shows step indicator. Main content renders current step component.

Steps: Intake -> Clarify -> Generate -> Evaluate -> Improve

Components:
- BuilderSidebar — step indicator with completion status
- IntakeForm — objective, taskType, audience, tone, constraints, modelTarget
- ClarifyPanel — follow-up question cards (2-4 questions)
- GeneratePanel — streaming prompt output with editable sections
- EvaluatePanel — score breakdown visualization (bar chart per dimension)
- ImprovePanel — edit sections + re-evaluate loop

State: useReducer with actions: INTAKE_SUBMITTED, CLARIFY_COMPLETED, PROMPT_GENERATED, EVALUATION_COMPLETE, VERSION_SAVED

## API Endpoints

### POST /api/builder/intake
- Input: BuilderIntake
- Claude call (temp 0.3): extract structured intent, detect ambiguities
- Output: { clarifyingQuestions, refinedIntent }

### POST /api/builder/clarify
- Input: { intake, answers }
- Merge answers into intent
- Output: { refinedIntent, ready: boolean }

### POST /api/builder/generate (STREAMING)
- Input: { refinedIntent, modelTarget }
- Claude streaming call (temp 0.5): generate structured prompt
- Output: ReadableStream -> PromptContent (systemContext, task, constraints, outputFormat, examples)
- Model-specific guidance included (Claude=XML tags, GPT=markdown, Gemini=section breaks)

### POST /api/builder/evaluate
- Input: { promptContent, intake }
- Deterministic checks + single Claude call (temp 0.2) for LLM dimensions
- Output: EvaluationRun

## Evaluation Engine

### Deterministic Dimensions
- Instruction compliance (20%): keyword presence matching against intake
- Efficiency (15%): token estimation, redundancy detection, bloat penalties

### LLM Judge Dimensions (single batched call)
- Semantic alignment (25%): intent capture accuracy
- Style/tone fit (15%): tone enforcement
- Robustness (15%): rephrase stability
- Overall quality / LLM judge (10%): holistic assessment

### Composite
- Weighted sum across all 6 dimensions
- Guidance: lowest 2 dimensions' suggestions combined

## Prompt Templates

1. Intake Analyzer (temp 0.3) — structured intent + ambiguities
2. Clarify Resolver (temp 0.2) — merge answers into final intent
3. Prompt Generator (temp 0.5) — 5-section structured prompt with model tips
4. Evaluation Judge (temp 0.2) — batch score 4 LLM dimensions in JSON
