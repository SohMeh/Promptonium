"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Swords,
  GraduationCap,
  Library,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Builder", href: "/builder", icon: Wand2 },
  { label: "Arena", href: "/arena", icon: Swords },
  { label: "Academy", href: "/academy", icon: GraduationCap },
  { label: "Vault", href: "/vault", icon: Library },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          if (active) setUserName(null);
          return;
        }

        const data = await response.json();
        if (active) {
          setUserName(data.user?.name ?? null);
        }
      } catch {
        if (active) setUserName(null);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r bg-sidebar/50 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/30">
        <div className="p-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Zap className="h-4 w-4 fill-white" />
          </div>
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Promptonium
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

        <div className="p-4 border-t border-border/50">
          {userName ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-primary/20 flex items-center justify-center">
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
                    isActive && "bg-primary/15 ring-1 ring-primary/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
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
