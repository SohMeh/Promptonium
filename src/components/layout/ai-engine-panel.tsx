"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useModel } from "@/context/model-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Globe, KeyRound, Check, Trash2 } from "lucide-react";

/**
 * Engine picker + bring-your-own-key controls.
 * Free engine needs a signed-in account; the Claude engine needs the
 * user's own Anthropic API key (kept in localStorage, sent per request).
 */
export function AiEnginePanel() {
  const { useOpenModel, toggleModel, apiKey, setApiKey } = useModel();
  const { data: session } = useSession();
  const [draftKey, setDraftKey] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const signedIn = Boolean(session?.user);

  function handleSaveKey() {
    if (!draftKey.trim()) return;
    setApiKey(draftKey);
    setDraftKey("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        AI Engine
      </p>
      <div className="flex rounded-lg border border-border overflow-hidden">
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
          Claude
        </button>
      </div>

      {useOpenModel ? (
        <div className="mt-2 px-1 space-y-1">
          <p className="text-[10px] text-muted-foreground">
            Free open model — may take 10–30s per request.
          </p>
          {!signedIn && (
            <p className="text-[10px] text-amber-500">
              <Link href="/login" className="underline underline-offset-2 hover:text-amber-400">
                Sign in
              </Link>{" "}
              to use the free engine, or switch to Claude with your own key.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {apiKey ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <KeyRound className="h-3 w-3" />
                Your key is set
              </span>
              <button
                type="button"
                onClick={() => setApiKey("")}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove API key"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <Input
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                placeholder="sk-ant-..."
                className="h-8 text-xs"
                autoComplete="off"
              />
              <Button
                size="sm"
                className="h-8 px-2.5"
                onClick={handleSaveKey}
                disabled={!draftKey.trim()}
              >
                {justSaved ? <Check className="h-3.5 w-3.5" /> : "Save"}
              </Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground px-1">
            {apiKey
              ? "Requests use your Anthropic key — no account needed."
              : signedIn
                ? "Add your Anthropic API key, or leave empty to use your account."
                : "Your key stays in this browser and is only sent with your requests."}
          </p>
        </div>
      )}
    </div>
  );
}
