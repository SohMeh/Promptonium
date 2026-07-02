"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Swords,
  GraduationCap,
  ArrowRight,
  ArrowDown,
  Library,
  KeyRound,
  UserRound,
  Globe,
  Sparkles,
} from "lucide-react";
import { getProgress, getProjects, getAttempts } from "@/lib/services/storage";
import { LEARNING_PATHS } from "@/data/academy/paths";
import { CHALLENGES } from "@/data/challenges";

const TICKER_TERMS = [
  "chain-of-thought",
  "few-shot examples",
  "system prompts",
  "role framing",
  "output schemas",
  "XML structure",
  "constraint design",
  "tone control",
  "self-critique loops",
  "delimiters",
  "step decomposition",
  "context windows",
  "rubric scoring",
  "instruction hierarchy",
];

const MODES = [
  {
    number: "01",
    title: "Prompt Builder",
    tagline: "From vague idea to production prompt",
    description:
      "Describe what you need in plain words. The Builder interrogates your intent with smart clarifying questions, then assembles a structured, model-ready prompt — scored across six quality dimensions so you know exactly what to tighten.",
    href: "/builder",
    cta: "Start building",
    icon: Wand2,
  },
  {
    number: "02",
    title: "Prompt Arena",
    tagline: "Skill under pressure",
    description:
      "Ten timed challenges across email, code, analysis, and creative writing. Submit your best prompt before the clock runs out, get a dimension-by-dimension verdict, and chase your own high score.",
    href: "/arena",
    cta: "Enter the arena",
    icon: Swords,
  },
  {
    number: "03",
    title: "Prompt Academy",
    tagline: "Fundamentals to advanced technique",
    description:
      "Twelve guided lessons across three learning paths, each ending in a hands-on practice checkpoint that's actually graded. Built for self-learners and educators alike — including ready-to-use classroom templates.",
    href: "/academy",
    cta: "Start learning",
    icon: GraduationCap,
  },
  {
    number: "04",
    title: "Prompt Vault",
    tagline: "Your prompts, versioned",
    description:
      "Every prompt you build is saved with its evaluation history. Re-open any project in the Builder, iterate, and stack new versions — your personal library of proven prompts grows as you do.",
    href: "/vault",
    cta: "Open the vault",
    icon: Library,
  },
];

const JOURNEY = [
  { step: "Learn", desc: "Pick up a technique in the Academy" },
  { step: "Build", desc: "Apply it in the Builder with AI guidance" },
  { step: "Test", desc: "Prove it in a timed Arena challenge" },
  { step: "Iterate", desc: "Version and refine it in your Vault" },
];

const BEFORE_PROMPT = `write me an email to my team about the deadline`;

const AFTER_PROMPT = `You are an engineering manager writing to a
team of 8 developers.

TASK: Announce that the v2.0 release deadline
moved from Mar 14 to Mar 28.

CONSTRAINTS:
- Under 150 words, no corporate filler
- Lead with the change, then the reason
- End with one clear ask

OUTPUT: Subject line + body, ready to send.`;

/** Adds .is-visible to .reveal children as they scroll into view. */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Home() {
  const pageRef = useRevealOnScroll<HTMLDivElement>();
  const [stats, setStats] = useState<{ prompts: number; lessons: number; attempts: number } | null>(
    null
  );

  // Personal stats live in localStorage, so they only exist client-side
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration must run post-mount
    setStats({
      prompts: getProjects().length,
      lessons: getProgress().filter((p) => p.completed).length,
      attempts: getAttempts().length,
    });
  }, []);

  const totalLessons = LEARNING_PATHS.reduce((s, p) => s + p.lessons.length, 0);

  return (
    <div ref={pageRef} className="relative flex flex-col overflow-hidden">
      {/* Atmosphere: ember orbs + grain */}
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true">
        <div className="drift-slow absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-orange-600/15 blur-[120px]" />
        <div className="drift-slower absolute top-[28rem] -right-48 h-[30rem] w-[30rem] rounded-full bg-amber-500/10 blur-[110px]" />
        <div className="drift-slow absolute bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-orange-500/8 blur-[100px]" />
      </div>

      {/* ---------------- Hero ---------------- */}
      <section className="relative z-10 px-6 pt-20 pb-14 sm:pt-28 md:px-14 lg:px-20">
        <p className="font-mono text-xs sm:text-sm text-primary/90 tracking-widest uppercase mb-6">
          $ the element of better prompts<span className="blink-cursor">▌</span>
        </p>
        <h1 className="font-display max-w-4xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight">
          Rough idea in.
          <br />
          <span className="ember-text ember-glow">Precision prompt</span> out.
        </h1>
        <p className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Promptonium turns prompt engineering into a craft you can practice — build with AI
          guidance, battle the clock, learn the theory, and keep every version you ship.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            size="lg"
            className="h-13 px-8 text-base font-semibold shadow-[0_0_35px_-8px_rgba(249,115,22,0.6)]"
            asChild
          >
            <Link href="/builder">
              <Wand2 className="h-5 w-5 mr-2" />
              Build a prompt
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-13 px-8 text-base border-primary/30 hover:border-primary/60 hover:bg-primary/10"
            asChild
          >
            <Link href="/academy">
              <GraduationCap className="h-5 w-5 mr-2" />
              Learn the craft
            </Link>
          </Button>
        </div>
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          No account needed to explore. AI features run on your account or your own API key.
        </p>
      </section>

      {/* ---------------- Ticker ---------------- */}
      <section
        className="relative z-10 border-y border-primary/15 bg-primary/[0.04] py-3 overflow-hidden"
        aria-hidden="true"
      >
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {TICKER_TERMS.map((term) => (
                <span
                  key={`${copy}-${term}`}
                  className="mx-6 flex items-center gap-6 font-mono text-sm text-muted-foreground/80 whitespace-nowrap"
                >
                  {term}
                  <Sparkles className="h-3 w-3 text-primary/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Before / After ---------------- */}
      <section className="relative z-10 px-6 py-24 md:px-14 lg:px-20">
        <div className="reveal max-w-2xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            The difference is <span className="ember-text">structure.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Same intent. One gets a shrug from the model — the other gets exactly what you meant.
          </p>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0">
          <div className="reveal lg:w-[38%] glass-card rounded-2xl p-6 lg:self-center lg:rotate-[-1.2deg]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
              before · what most people type
            </p>
            <pre className="font-mono text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
              {BEFORE_PROMPT}
            </pre>
            <div className="mt-4 inline-flex items-center rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 font-mono text-xs text-destructive">
              score 31/100
            </div>
          </div>

          <div className="reveal flex items-center justify-center px-6 py-2 lg:py-0" aria-hidden="true">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_30px_-6px_rgba(249,115,22,0.5)]">
              <ArrowRight className="hidden lg:block h-6 w-6 text-primary" />
              <ArrowDown className="lg:hidden h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="reveal flex-1 glass-card rounded-2xl p-6 border-primary/25 lg:rotate-[0.8deg] shadow-[0_0_60px_-20px_rgba(249,115,22,0.35)]">
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">
              after · what promptonium builds
            </p>
            <pre className="font-mono text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {AFTER_PROMPT}
            </pre>
            <div className="mt-4 inline-flex items-center rounded-full border border-primary/50 bg-primary/15 px-3 py-1 font-mono text-xs text-primary">
              score 92/100
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Modes: flowing alternating sections ---------------- */}
      <section className="relative z-10 px-6 md:px-14 lg:px-20 pb-10">
        {MODES.map((mode, idx) => {
          const Icon = mode.icon;
          const alignRight = idx % 2 === 1;
          return (
            <div
              key={mode.href}
              className={`reveal relative py-14 md:py-20 flex ${
                alignRight ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-display font-extrabold text-[9rem] md:text-[13rem] leading-none text-primary/[0.06] select-none ${
                  alignRight ? "left-0" : "right-0"
                }`}
                aria-hidden="true"
              >
                {mode.number}
              </span>

              <div className={`relative max-w-xl ${alignRight ? "text-right" : ""}`}>
                <div
                  className={`inline-flex items-center gap-3 mb-4 ${
                    alignRight ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-[0_0_25px_-6px_rgba(249,115,22,0.45)]">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest text-primary/80">
                    {mode.tagline}
                  </p>
                </div>
                <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  {mode.title}
                </h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                  {mode.description}
                </p>
                <Button
                  variant="outline"
                  className="group border-primary/30 hover:border-primary/70 hover:bg-primary/10"
                  asChild
                >
                  <Link href={mode.href}>
                    {mode.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------------- Journey timeline ---------------- */}
      <section className="relative z-10 px-6 py-24 md:px-14 lg:px-20 border-t border-primary/10 bg-primary/[0.03]">
        <div className="reveal max-w-2xl mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            One loop. <span className="ember-text">Compounding skill.</span>
          </h2>
        </div>

        <div className="relative max-w-2xl mx-auto md:mx-0 md:ml-24">
          <div
            className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/70 via-primary/30 to-transparent"
            aria-hidden="true"
          />
          {JOURNEY.map((item, idx) => (
            <div key={item.step} className="reveal relative pl-14 pb-12 last:pb-0">
              <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-primary/50 bg-background shadow-[0_0_18px_-4px_rgba(249,115,22,0.6)]">
                <span className="font-mono text-[10px] font-bold text-primary">{idx + 1}</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold">{item.step}</h3>
              <p className="text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Personal progress chips */}
        {stats && (stats.prompts > 0 || stats.lessons > 0 || stats.attempts > 0) && (
          <div className="reveal mt-16 flex flex-wrap gap-3">
            <span className="font-mono text-xs text-muted-foreground self-center mr-1">
              your journey so far:
            </span>
            {[
              { label: "prompts saved", val: stats.prompts },
              { label: `lessons done / ${totalLessons}`, val: stats.lessons },
              { label: "arena attempts", val: stats.attempts },
            ].map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 font-mono text-xs"
              >
                <span className="text-primary font-bold">{s.val}</span>
                <span className="text-muted-foreground">{s.label}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Access model + CTA ---------------- */}
      <section className="relative z-10 px-6 py-24 md:px-14 lg:px-20">
        <div className="reveal relative max-w-4xl mx-auto rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-amber-500/5 p-10 md:p-16 overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-[90px]"
            aria-hidden="true"
          />
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Start in the next <span className="ember-text">ten seconds.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
            Everything is open — browse challenges ({CHALLENGES.length}), lessons ({totalLessons}),
            and the Builder with zero sign-up. When you want the AI to work for you, pick one:
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            {[
              {
                icon: UserRound,
                title: "Create a free account",
                desc: "Unlocks the free AI engine — no card, no key.",
              },
              {
                icon: KeyRound,
                title: "Bring your own key",
                desc: "Paste an Anthropic API key. It never leaves your browser storage.",
              },
              {
                icon: Globe,
                title: "Just browse",
                desc: "Lessons, challenges, and your Vault work without either.",
              },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.title}
                  className="flex-1 rounded-2xl border border-primary/15 bg-background/40 p-5"
                >
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 font-semibold shadow-[0_0_30px_-8px_rgba(249,115,22,0.6)]"
              asChild
            >
              <Link href="/builder">Open the Builder</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 border-primary/30 hover:bg-primary/10"
              asChild
            >
              <Link href="/signup">Create free account</Link>
            </Button>
          </div>
        </div>

        <p className="mt-12 text-center font-mono text-xs text-muted-foreground">
          promptonium_. — the element of better prompts
        </p>
      </section>
    </div>
  );
}
