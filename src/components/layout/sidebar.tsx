"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useModel } from "@/context/model-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Swords,
  GraduationCap,
  Library,
  Linkedin,
  Zap,
  Globe,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Builder", href: "/builder", icon: Wand2 },
  { label: "Arena", href: "/arena", icon: Swords },
  { label: "Academy", href: "/academy", icon: GraduationCap },
  { label: "Vault", href: "/vault", icon: Library },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? null;
  const { useOpenModel, toggleModel } = useModel();

  function handleLogout() {
    signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r bg-sidebar/50 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/30">
        <div className="p-6 flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Promptonium logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-contain"
          />
          <Link href="/" className="text-xl font-bold tracking-tight font-mono">
            <span className="text-foreground">Promptonium</span><span className="text-primary">_.</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:shadow-sm"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  <span className={cn("font-medium", isActive && "font-semibold")}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Created by Sohum Mehta</span>
            <a
              href="https://www.linkedin.com/in/sohummehta/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Sohum Mehta on LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* AI Engine toggle */}
        <div className="px-4 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            AI Engine
          </p>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => useOpenModel && toggleModel()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                !useOpenModel
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Zap className="h-3 w-3" />
              API Key (currently down)
            </button>
            <button
              type="button"
              onClick={() => !useOpenModel && toggleModel()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                useOpenModel
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Globe className="h-3 w-3" />
              Free
            </button>
          </div>
          {useOpenModel && (
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Free model may take 10–30s
            </p>
          )}
        </div>

        <div className="p-4 border-t border-border/50">
          {userName ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30">
                <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {userName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">Logged in</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 p-1 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/15 ring-1 ring-primary/30 shadow-[0_0_15px_-3px_rgba(235,117,47,0.3)]"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
