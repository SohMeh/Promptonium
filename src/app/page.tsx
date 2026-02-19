import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MODES = [
  {
    title: "Prompt Builder",
    description: "Create optimized prompts for any AI model with guided intake, smart clarification, and scoring feedback.",
    href: "/builder",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Prompt Arena",
    description: "Test your prompting skills with timed challenges, earn scores, and climb the leaderboard.",
    href: "/arena",
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Prompt Academy",
    description: "Learn prompt engineering from beginner to advanced with interactive lessons and practice.",
    href: "/academy",
    color: "from-emerald-500 to-teal-600",
  },
] as const;

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Promptonium
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Create better prompts. Practice with challenges. Master prompt engineering.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {MODES.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${mode.color} mb-3`} />
                <CardTitle className="group-hover:text-primary transition-colors">
                  {mode.title}
                </CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
