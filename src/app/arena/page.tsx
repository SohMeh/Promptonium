"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeBrowser } from "@/components/arena/challenge-browser";

export default function ArenaPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
      <div className="mb-10 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(235,117,47,0.3)]">
              Prompt Arena
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-2xl">
              Test your prompt engineering skills with timed challenges. Write the
              best prompt you can before time runs out, and see how your score
              compares on the global leaderboard.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 glass-card border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/50 shadow-[0_0_15px_-5px_rgba(235,117,47,0.3)]">
            <Link href="/arena/leaderboard">
              <BarChart3 className="h-4 w-4 mr-2 text-orange-400" />
              <span className="font-semibold">Leaderboard</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative mb-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent mb-8" />
        <ChallengeBrowser />
      </div>

      {/* Cross-link to Academy */}
      <Card className="glass-card border-emerald-500/20 bg-emerald-500/5 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="py-6 px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
                <GraduationCap className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-1">New to prompt engineering?</p>
                <p className="text-sm text-emerald-100/70">Learn the fundamentals in the Academy before tackling timed challenges.</p>
              </div>
            </div>
            <Button variant="secondary" size="lg" asChild className="shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-50 border border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
              <Link href="/academy">
                Browse Academy
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
