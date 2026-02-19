# Promptonium MVP Design

**Date:** 2026-02-19
**Status:** Approved

## Overview

Promptonium is a 3-mode integrated platform that helps users create better prompts across major AI models, practice prompting through gamified challenges, and learn prompt engineering through curriculum-style content.

**Launch target:** Polished clickable demo with real LLM calls.

## Locked Decisions

| Decision | Choice |
|---|---|
| Build location | NewApp/ |
| Build approach | Vertical slice (Builder first) |
| UI framework | shadcn/ui + Tailwind CSS |
| Primary LLM | Anthropic Claude |
| Storage | localStorage + in-memory |
| Demo mode | Real LLM calls (no mock) |
| Architecture | Next.js App Router, provider adapter pattern |
| Context capture | Opt-in uploads only, no passive scraping |
| Key management | Platform-managed for demo, BYOK-ready architecture |
