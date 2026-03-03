"use client";

import { SessionProvider } from "next-auth/react";
import { ModelProvider } from "@/context/model-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModelProvider>{children}</ModelProvider>
    </SessionProvider>
  );
}
