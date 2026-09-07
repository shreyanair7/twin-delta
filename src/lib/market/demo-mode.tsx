import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DemoScenario } from "./types";

const STORAGE_KEY = "delta.demo.scenario";

export const SCENARIOS: { id: DemoScenario; label: string; description: string }[] = [
  { id: "normal", label: "Normal market", description: "Quiet session, nothing unusual." },
  {
    id: "unusual_drop",
    label: "Unusual stock drop",
    description: "One holding falls far outside its normal range.",
  },
  {
    id: "it_sector",
    label: "IT sector movement",
    description: "Several IT names move together; feed runs slightly delayed.",
  },
  { id: "stale_data", label: "Stale data", description: "No trustworthy update for 35 minutes." },
  {
    id: "conflicting_data",
    label: "Conflicting data",
    description: "Sources disagree; nothing is marked meaningful.",
  },
];

type Ctx = { scenario: DemoScenario; setScenario: (s: DemoScenario) => void };

const DemoModeContext = createContext<Ctx>({ scenario: "normal", setScenario: () => {} });

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<DemoScenario>("normal");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as DemoScenario | null;
    if (stored && SCENARIOS.some((s) => s.id === stored)) setScenarioState(stored);
  }, []);

  const setScenario = useCallback((s: DemoScenario) => {
    setScenarioState(s);
    window.localStorage.setItem(STORAGE_KEY, s);
  }, []);

  const value = useMemo(() => ({ scenario, setScenario }), [scenario, setScenario]);
  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
