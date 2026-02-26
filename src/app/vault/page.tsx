"use client";

import { useState, useEffect, useCallback } from "react";
import type { PromptProject } from "@/lib/types/prompt";
import { getProjects, deleteProject } from "@/lib/services/storage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PromptList } from "@/components/vault/prompt-list";
import { PromptDetail } from "@/components/vault/prompt-detail";
import { VersionDiff } from "@/components/vault/version-diff";
import { ProfilePanel } from "@/components/vault/profile-panel";
import { AchievementsPanel } from "@/components/vault/achievements-panel";
import { Library } from "lucide-react";

export default function VaultPage() {
  const [projects, setProjects] = useState<PromptProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PromptProject | null>(
    null
  );

  const loadProjects = useCallback(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSelect = (project: PromptProject) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
    loadProjects();
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setSelectedProject(null);
    loadProjects();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
      <div className="mb-10 pt-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30">
          <Library className="h-8 w-8 text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            Prompt Vault
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Your personal repository of saved prompts, version histories, and achievements.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 relative">
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="bg-background/50 border border-white/5 mb-8 h-12">
            <TabsTrigger value="prompts" className="px-8 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-100 data-[state=active]:shadow-[0_0_15px_-3px_rgba(217,70,239,0.3)] transition-all rounded-lg">My Prompts</TabsTrigger>
            <TabsTrigger value="profile" className="px-8 data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-100 data-[state=active]:shadow-[0_0_15px_-3px_rgba(217,70,239,0.3)] transition-all rounded-lg">Profile & Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-0 outline-none">
            {selectedProject ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                <PromptDetail
                  project={selectedProject}
                  onBack={handleBack}
                  onDelete={handleDelete}
                />
                {selectedProject.versions.length >= 2 && (
                  <VersionDiff versions={selectedProject.versions} />
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <PromptList
                  projects={projects}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-0 outline-none space-y-8 animate-in fade-in duration-500">
            <ProfilePanel />
            <AchievementsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
