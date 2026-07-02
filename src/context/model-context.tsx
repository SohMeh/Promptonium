"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ENGINE_KEY = "promptonium:model-provider";
const API_KEY_KEY = "promptonium:anthropic-api-key";

type ModelContextValue = {
  /** True when the free open-model engine is selected. */
  useOpenModel: boolean;
  toggleModel: () => void;
  /** The user's own Anthropic API key (kept in this browser only). */
  apiKey: string;
  setApiKey: (key: string) => void;
  /** Headers to attach to every AI request. */
  aiHeaders: () => Record<string, string>;
  hydrated: boolean;
};

const ModelContext = createContext<ModelContextValue>({
  useOpenModel: true,
  toggleModel: () => {},
  apiKey: "",
  setApiKey: () => {},
  aiHeaders: () => ({}),
  hydrated: false,
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
  // Default to the free engine so the app works out of the box.
  const [useOpenModel, setUseOpenModel] = useState(true);
  const [apiKey, setApiKeyState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — must happen post-SSR so the
  // server-rendered defaults match the first client render.
  useEffect(() => {
    const storedEngine = localStorage.getItem(ENGINE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedEngine === "api") setUseOpenModel(false);
    const storedKey = localStorage.getItem(API_KEY_KEY);
    if (storedKey) setApiKeyState(storedKey);
    setHydrated(true);
  }, []);

  function toggleModel() {
    setUseOpenModel((prev) => {
      const next = !prev;
      localStorage.setItem(ENGINE_KEY, next ? "free" : "api");
      return next;
    });
  }

  function setApiKey(key: string) {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem(API_KEY_KEY, trimmed);
    } else {
      localStorage.removeItem(API_KEY_KEY);
    }
  }

  const aiHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (useOpenModel) {
      headers["X-Use-Open-Model"] = "1";
    } else if (apiKey) {
      headers["X-User-Api-Key"] = apiKey;
    }
    return headers;
  }, [useOpenModel, apiKey]);

  return (
    <ModelContext.Provider
      value={{ useOpenModel, toggleModel, apiKey, setApiKey, aiHeaders, hydrated }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
