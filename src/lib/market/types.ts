/**
 * Domain types for DELTA's market layer.
 *
 * These types describe the contract the UI consumes. Today the only
 * implementation is the demo source (see `demo-source.ts`); a live market feed
 * can be swapped in behind the same interface without touching components.
 */

export type Classification = "attention" | "worth_knowing" | "normal" | "noise";

export type FreshnessState = "live" | "delayed" | "stale" | "conflicting";

export interface DataFreshness {
  state: FreshnessState;
  /** ISO timestamp of the latest received tick. */
  updatedAt: string;
  /** ISO timestamp of the latest update we consider trustworthy. */
  lastReliableAt: string;
  confidence: "high" | "medium" | "low";
}

export interface ScoreBreakdown {
  priceMovement: number;
  volatilityAnomaly: number;
  timeRelevance: number;
  userRelevance: number;
  dataConfidence: number;
  total: number;
}

export interface Quote {
  symbol: string;
  name: string;
  currency: "INR" | "USD";
  price: number;
  /** Price the user saw during their previous session. */
  lastSeenPrice: number;
  dayChangePct: number;
  sinceLastSeenPct: number;
  /** How many times bigger this move is than the symbol's usual range. */
  volatilityMultiple: number;
  classification: Classification;
  scores: ScoreBreakdown;
  spark: number[];
  reasons: string[];
}

export interface AttentionCounts {
  attention: number;
  worthKnowing: number;
  normal: number;
  noise: number;
}

export interface Pattern {
  id: string;
  label: string;
  headline: string;
  direction: "up" | "down";
  members: { symbol: string; name: string; pct: number }[];
  strength: number;
  description: string;
}

export interface ReplayEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
  symbol?: string;
  kind: "movement" | "meaningful" | "sector" | "market";
}

export interface MarketBriefing {
  lastCheckedAt: string;
  awayLabel: string;
  counts: AttentionCounts;
  attentionLoad: "low" | "moderate" | "high";
  freshness: DataFreshness;
  quotes: Quote[];
  patterns: Pattern[];
  replay: ReplayEvent[];
}

export type DemoScenario =
  | "normal"
  | "unusual_drop"
  | "it_sector"
  | "stale_data"
  | "conflicting_data";

export interface MarketSource {
  id: "demo" | "live";
  getBriefing(input: {
    symbols: { symbol: string; name: string }[];
    lastCheckedAt: string | null;
    scenario: DemoScenario;
  }): MarketBriefing;
}
