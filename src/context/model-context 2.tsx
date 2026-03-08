"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "promptonium:model-provider";

type ModelContextValue = {
  useOpenModel: boolean;
  toggleModel: () => void;
};

const ModelContext = createContext<ModelContextValue>({
  useOpenModel: false,
  toggleModel: () => {},
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [useOpenModel, setUseOpenModel] = useState(false);

  // Hydrate from localStorage on mount (after SSR)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "free") setUseOpenModel(true);
  }, []);

  function toggleModel() {
    setUseOpenModel((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "free" : "api");
      return next;
    });
  }

  return (
    <ModelContext.Provider value={{ useOpenModel, toggleModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
