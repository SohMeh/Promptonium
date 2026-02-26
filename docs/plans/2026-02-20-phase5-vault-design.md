# Phase 5: Vault & Profile — Design

**Date:** 2026-02-20
**Status:** Approved

## Overview

Prompt history with versions, evaluation scores, filtering/tags, and a user profile with achievements and stats.

## Locked Decisions

| Decision | Choice |
|---|---|
| Storage | localStorage (existing storage service) |
| Diff view | Side-by-side text diff (simple) |
| Achievements | Client-side check on each save/complete |
| Stats | Computed from localStorage data |

## Components

### `src/app/vault/page.tsx`
- Two tabs: "My Prompts" and "Profile"
- My Prompts: list of saved projects with search + filter
- Profile: achievements + stats

### `src/components/vault/prompt-list.tsx`
- List of saved PromptProject items
- Each row: title, model target, source mode (builder/arena), tags, best score, date
- Search by title
- Filter by tag/model/source mode
- Click → expand to show versions

### `src/components/vault/prompt-detail.tsx`
- Shows full prompt content (all 5 sections)
- Evaluation score summary if available
- Version selector dropdown (if multiple versions)
- "Open in Builder" button (loads prompt into Builder for re-editing)
- "Delete" button with confirmation

### `src/components/vault/version-diff.tsx`
- Side-by-side diff of two versions
- Simple text comparison highlighting additions/removals
- Version selector for left and right

### `src/components/vault/profile-panel.tsx`
- User display name (editable)
- Stats cards: total prompts, average score, challenges completed, lessons completed
- Stats computed from localStorage data

### `src/components/vault/achievements-panel.tsx`
- Grid of achievement badges
- Locked (gray) vs unlocked (colored) states
- Each shows: name, description, unlock date

## Achievements System

Define achievements in `src/data/achievements.ts`:
1. "First Prompt" — save your first prompt
2. "Perfectionist" — score 90+ on any prompt
3. "Speed Demon" — complete an expert challenge under time
4. "Five Star" — save 5 prompts to vault
5. "Scholar" — complete a learning path
6. "Challenger" — complete 5 arena challenges
7. "Multi-Model" — create prompts for 3 different target models
8. "Improver" — re-evaluate a prompt and increase score by 10+

### `src/lib/services/achievements.ts`
- `checkAchievements()` — checks all conditions against localStorage data
- Returns newly unlocked achievements
- Called after saves, challenge completions, lesson completions

## API Route

### POST /api/vault/save
- Input: { project: PromptProject }
- Save to localStorage via storage service
- Check achievements
- Return: { saved: true, newAchievements: Achievement[] }

## Profile

- User profile auto-created on first visit (or use existing from localStorage)
- Stats computed on render from:
  - getProjects().length → totalPrompts
  - Average of all evaluation scores → averageScore
  - getAttempts() filtered by unique challengeId → challengesCompleted
  - getProgress() filtered by completed === true → lessonsCompleted
