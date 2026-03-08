"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Swords,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Trophy,
  Zap,
  X,
  Sparkles,
} from "lucide-react";
import { getProgress, getProjects } from "@/lib/services/storage";
import { LEARNING_PATHS } from "@/data/academy/paths";
import { CHALLENGES } from "@/data/challenges";

const MODES = [
  {
    title: "Prompt Builder",
    description:
      "Create optimized prompts for any AI model with guided intake, clarifying questions, and quality scoring.",
    href: "/builder",
    icon: Wand2,
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    cta: "Start Building",
  },
  {
    title: "Prompt Arena",
    description:
      "Test your prompting skills with timed challenges, earn scores, and climb the leaderboard.",
    href: "/arena",
    icon: Swords,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    cta: "Enter Arena",
  },
  {
    title: "Prompt Academy",
    description:
      "Learn prompt engineering from beginner to advanced through guided lessons and hands-on practice.",
    href: "/academy",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    cta: "Start Learning",
  },
] as const;

const STEPS = [
  {
    num: "1",
    title: "Describe your goal",
    desc: "Tell us what you need the AI to do — we'll ask smart follow-up questions.",
  },
  {
    num: "2",
    title: "Get an optimized prompt",
    desc: "We generate a structured, production-ready prompt tailored to your model.",
  },
  {
    num: "3",
    title: "Review & improve",
    desc: "See dimension-level scoring and actionable tips to refine your prompt.",
  },
];

const WELCOME_DISMISSED_KEY = "promptonium:welcome-dismissed";

const SUGGESTED_PATH = [
  {
    step: "1",
    title: "Learn the fundamentals",
    desc: "Start with a beginner lesson in the Academy to learn core prompting techniques.",
    href: "/academy",
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    step: "2",
    title: "Build your first prompt",
    desc: "Use the Builder to create an optimized, production-ready prompt with AI guidance.",
    href: "/builder",
    icon: Wand2,
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    step: "3",
    title: "Test your skills",
    desc: "Challenge yourself in the Arena with timed exercises and see how you score.",
    href: "/arena",
    icon: Swords,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export default function Home() {
  const progress = useMemo(() => getProgress(), []);
  const projects = useMemo(() => getProjects(), []);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY);
    if (!dismissed) setShowWelcome(true);
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    setShowWelcome(false);
  };

  const lessonsCompleted = progress.filter((p) => p.completed).length;
  const totalLessons = LEARNING_PATHS.reduce(
    (s, p) => s + p.lessons.length,
    0
  );
  const promptsSaved = projects.length;
  const challengeCount = CHALLENGES.length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight font-mono">
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Promptonium</span><span className="text-primary">_.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create better prompts. Practice with challenges. Master prompt
          engineering — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/builder">
              <Wand2 className="h-4 w-4 mr-2" />
              Build a Prompt
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/academy">
              <GraduationCap className="h-5 w-5 mr-2" />
              Start Learning
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 my-8">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
              {[
                { label: "Prompts Saved", val: promptsSaved },
                { label: "Arena Challenges", val: challengeCount },
                { label: "Academy Lessons", val: totalLessons },
                { label: "Lessons Completed", val: lessonsCompleted },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col justify-center px-4">
                  <div className="text-3xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">{stat.val}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mode cards */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link key={mode.href} href={mode.href} className="group outline-none">
                <Card className="glass-card h-full transition-all duration-300 border border-white/5 rounded-2xl overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mode.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center justify-center p-3 rounded-xl ${mode.bg} mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {mode.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                      {mode.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-primary/5 border-y border-white/5 backdrop-blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Prompt Builder Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Experience a fluid, intelligent workflow designed to turn your ideas into highly effective AI prompts.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-[24px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {STEPS.map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-background border border-primary/30 text-primary font-black mb-6 shadow-[0_0_15px_-3px_rgba(235,117,47,0.3)] group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_20px_0_rgba(235,117,47,0.5)] z-10 relative">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12 text-white drop-shadow-sm">
          Everything You Need
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Zap, title: "Smart Analysis", desc: "AI analyzes your request and asks the right clarifying questions." },
            { icon: CheckCircle2, title: "Quality Scoring", desc: "6-dimension evaluation with actionable improvement tips." },
            { icon: Trophy, title: "Timed Challenges", desc: "Practice under pressure and climb the leaderboard." },
            { icon: BookOpen, title: "Guided Learning", desc: "Structured lessons from beginner to advanced techniques." },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-6 text-center hover:bg-white/[0.02] transition-colors border border-white/5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 border border-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24 relative z-10">
        <div className="glass-card rounded-3xl p-1 max-w-4xl mx-auto overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-amber-600/30 opacity-50" />
          <div className="relative bg-background/80 backdrop-blur-md rounded-[22px] p-10 md:p-16 text-center border border-white/5">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to build better prompts?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start with the Builder for instant results, or dive into the Academy to master the fundamentals of prompt engineering.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 font-semibold shadow-[0_0_20px_-5px_rgba(235,117,47,0.4)]" asChild>
                <Link href="/builder">Open Prompt Builder</Link>
              </Button>
              <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold bg-white/5 hover:bg-white/10" asChild>
                <Link href="/academy">Browse Academy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
