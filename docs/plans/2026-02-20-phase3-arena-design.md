# Phase 3: Prompt Arena — Design

**Date:** 2026-02-20
**Status:** Approved

## Overview

Gamified prompt challenges with timed sessions, scoring via the hybrid rubric (with per-challenge overrides), and a leaderboard.

## Locked Decisions

| Decision | Choice |
|---|---|
| Challenge data | Static JSON in `src/data/challenges/` |
| Timer | Client-side countdown, enforced at submit |
| Scoring | Reuse evaluation-engine with rubricOverrides |
| Leaderboard | localStorage-based, per-challenge + overall |
| Open model support | Same toggle as Builder (useOpenModel) |

## Data: Challenge Sets

Create `src/data/challenges/index.ts` with 8-12 challenges across categories:
- email (2), summarization (2), coding (2), creative (2), analysis (2), education (1-2)
- Each has: id, title, description, category, difficulty, timeLimit (seconds), targetModel, rubricOverrides
- Difficulties: beginner (300s), intermediate (240s), advanced (180s), expert (120s)

## Components

### `src/components/arena/challenge-browser.tsx`
- Grid of challenge cards, filterable by category and difficulty
- Each card shows: title, category badge, difficulty badge, time limit, best score (if attempted)
- Click → navigate to challenge page

### `src/app/arena/[id]/page.tsx` (dynamic route)
- Challenge detail + prompt writing area
- Timer countdown (starts on first keystroke or "Start" button)
- Textarea for prompt writing
- Submit button (disabled when time expires)
- On submit: call evaluation API, show results

### `src/components/arena/timer.tsx`
- Visual countdown timer (mm:ss)
- Color changes: green → yellow (25%) → red (10%)
- Pulse animation in final 10 seconds

### `src/components/arena/challenge-result.tsx`
- Shows evaluation results after submission
- Score breakdown + comparison to personal best
- "Try Again" and "Back to Challenges" buttons

### `src/app/arena/leaderboard/page.tsx`
- Tabs: Overall | Per-Category
- Table: rank, challenge name, best score, date, time taken
- Pull from localStorage attempts

## API Routes

### GET /api/arena/challenges
- Returns all challenges from static data
- Optional query params: ?category=email&difficulty=beginner

### POST /api/arena/attempt
- Input: { challengeId, promptContent, startedAt, submittedAt }
- Construct a PromptContent + BuilderIntake from challenge data
- Call evaluatePrompt with challenge's rubricOverrides
- Save attempt to localStorage
- Return: { evaluation, attempt }

### GET /api/arena/leaderboard
- Returns sorted attempts from localStorage (via API for consistency)
- Query: ?challengeId=xxx or overall

## Flow

1. User browses challenges → picks one
2. Challenge page loads with description + timer
3. User writes prompt, timer counts down
4. Submit → evaluation runs → results shown
5. Score saved to localStorage, leaderboard updates
