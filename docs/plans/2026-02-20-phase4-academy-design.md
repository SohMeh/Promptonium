# Phase 4: Prompt Academy — Design

**Date:** 2026-02-20
**Status:** Approved

## Overview

Curriculum-style learning paths with lesson content, practice scenarios, progress tracking, and Edu Mode for educators.

## Locked Decisions

| Decision | Choice |
|---|---|
| Content | Static data in `src/data/academy/` |
| Progress | localStorage via existing storage service |
| Practice scoring | Same evaluation engine as Builder |
| Edu Mode | Separate sub-page, pedagogy-focused templates |

## Data: Learning Paths

Create `src/data/academy/paths.ts` with 3 learning paths:

### Path 1: Prompt Foundations (beginner, 5 lessons)
1. What Makes a Good Prompt — intro to prompt structure
2. Being Specific — the power of clear instructions
3. Tone and Style Control — guiding AI voice
4. Structured Prompting — sections, roles, constraints
5. Iteration and Refinement — the edit-evaluate loop

### Path 2: Advanced Techniques (intermediate, 4 lessons)
1. Few-Shot Prompting — teaching by example
2. Chain of Thought — step-by-step reasoning
3. Role-Playing and Personas — persona-based prompts
4. Handling Edge Cases — robust prompt design

### Path 3: Educator's Toolkit (advanced, 3 lessons, isEduMode=true)
1. Bloom's Taxonomy in Prompts — mapping cognitive levels
2. Scaffolding with AI — progressive complexity
3. Assessment Prompt Design — rubrics and evaluation

Each lesson has: id, pathId, order, title, description, contentMarkdown (3-5 paragraphs of educational content), practice (scenario + hints + example), checkpointThreshold (score needed to pass, typically 65-70)

## Components

### `src/components/academy/path-browser.tsx`
- Cards for each learning path
- Shows: title, difficulty badge, lesson count, progress bar (X/Y completed)

### `src/components/academy/lesson-view.tsx`
- Markdown-rendered lesson content (use a simple markdown renderer)
- Practice scenario section at bottom
- "Start Practice" button

### `src/components/academy/practice-panel.tsx`
- Shows the practice scenario description
- Textarea for writing the practice prompt
- Hints section (collapsible, reveal one at a time)
- Submit → evaluate → show results
- If score >= checkpointThreshold → mark lesson complete

### `src/components/academy/progress-card.tsx`
- Shows progress for a single lesson
- Status: not started / in progress / completed
- Best score, attempts count

### `src/app/academy/page.tsx`
- Path browser with all learning paths
- Overall progress stats at top

### `src/app/academy/[pathId]/page.tsx` (dynamic route)
- Shows lessons for a path in order
- Each lesson card shows completion status
- Click → navigate to lesson

### `src/app/academy/[pathId]/[lessonId]/page.tsx` (dynamic route)
- Full lesson view + practice panel

### `src/app/academy/edu/page.tsx`
- Edu Mode landing page
- Shows the Educator's Toolkit path prominently
- Extra section: "Quick Pedagogy Prompt Templates" (3-4 pre-built templates for common educator tasks)

## API Routes

### GET /api/academy/paths
- Returns all learning paths with progress overlay from localStorage

### POST /api/academy/progress
- Input: { pathId, lessonId, promptContent }
- Evaluate the practice prompt
- If score >= threshold: mark lesson completed
- Save progress record
- Return: { evaluation, progress, passed }

## Edu Mode Templates

Pre-built prompt templates in `src/data/academy/edu-templates.ts`:
1. Lesson Plan Generator — creates lesson plans aligned to standards
2. Assignment Rubric Builder — generates grading rubrics
3. Student Feedback Writer — personalized feedback at scale
4. Differentiation Prompter — adapts content for different learning levels

Each template has: id, title, description, template (pre-filled prompt), targetModel
