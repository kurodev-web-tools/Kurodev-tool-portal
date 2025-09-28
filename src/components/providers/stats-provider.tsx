"use client";

import { createContext, useContext, ReactNode } from "react";
import { useStats } from "@/hooks/use-stats";

interface Tool {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href: string;
  iconName?: string;
  color?: string;
}

interface Suite {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
}

interface StatsContextType {
  tools: Tool[];
  suites: Suite[];
  stats: ReturnType<typeof useStats>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

interface StatsProviderProps {
  tools: Tool[];
  suites: Suite[];
  children: ReactNode;
}

export function StatsProvider({ tools, suites, children }: StatsProviderProps) {
  const stats = useStats({ tools, suites });

  return (
    <StatsContext.Provider value={{ tools, suites, stats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStatsContext() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStatsContext must be used within a StatsProvider');
  }
  return context;
}
