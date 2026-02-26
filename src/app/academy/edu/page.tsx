"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { EDU_TEMPLATES } from "@/data/academy/edu-templates";

export default function EduModePage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (template: string, id: string) => {
    await navigator.clipboard.writeText(template);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Educator Mode</h1>
        </div>
        <p className="text-muted-foreground">
          Prompt engineering tools and learning paths designed specifically for educators.
        </p>
      </div>

      {/* Educator's Toolkit Learning Path */}
      <Card className="mb-10 border-primary/30 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                Learning Path
              </Badge>
              <h2 className="text-xl font-semibold mb-2">
                Educator&apos;s Toolkit
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Master advanced prompt engineering techniques designed for
                educators — Bloom&apos;s Taxonomy alignment, scaffolded learning
                sequences, and AI-powered assessment design.
              </p>
              <Button asChild>
                <Link href="/academy/educators-toolkit">
                  Start Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Quick Pedagogy Templates
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ready-to-use prompt templates for common educator tasks. Copy and
          customize for your needs.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {EDU_TEMPLATES.map((tmpl) => (
            <Card key={tmpl.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tmpl.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tmpl.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(tmpl.template, tmpl.id)}
                >
                  {copiedId === tmpl.id ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
