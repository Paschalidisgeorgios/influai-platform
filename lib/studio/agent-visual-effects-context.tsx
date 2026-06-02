"use client";

import { createContext, useContext, type ReactNode } from "react";

type AgentVisualEffectsContextValue = {
  /** Agent motion/glow enabled (generator overlay or explicit landing showcase). */
  enabled: boolean;
};

const AgentVisualEffectsContext = createContext<AgentVisualEffectsContextValue>({
  enabled: false,
});

type ProviderProps = {
  enabled: boolean;
  children: ReactNode;
};

export function AgentVisualEffectsProvider({
  enabled,
  children,
}: ProviderProps) {
  return (
    <AgentVisualEffectsContext.Provider value={{ enabled }}>
      {children}
    </AgentVisualEffectsContext.Provider>
  );
}

export function useAgentVisualEffectsEnabled(): boolean {
  return useContext(AgentVisualEffectsContext).enabled;
}
