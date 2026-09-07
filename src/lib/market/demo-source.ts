/**
 * DEMO MARKET SOURCE — NOT PRODUCTION DATA.
 *
 * Every simulated number in DELTA lives in this file. Nothing else in the app
 * invents prices, movements or scores. When a live feed and the Meaningfulness
 * Engine land, implement `MarketSource` against them and swap the source in
 * `market-service.ts`; no component changes are required.
 */
import type {
  AttentionCounts,
  Classification,
  DataFreshness,
  DemoScenario,
  MarketBriefing,
  MarketSource,
  Pattern,
  Quote,
  ReplayEvent,
  ScoreBreakdown,
} from "./types";

const IT_SYMBOLS = ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"];
// Seeded portfolio profile used by the default demo. This intentionally contains
// seven high-signal changes so every DELTA surface has useful analysis to show.
const DEMO_PORTFOLIO: Record<string, { pct: number; vol: number; tier: Classification }> = {
  TATAMOTORS: { pct: -6.2, vol: 3.4, tier: "attention" },
  TCS: { pct: -4.8, vol: 3.1, tier: "attention" },
  INFY: { pct: -4.3, vol: 2.9, tier: "attention" },
  BAJFINANCE: { pct: -5.1, vol: 2.8, tier: "attention" },
  SUNPHARMA: { pct: 4.6, vol: 3.0, tier: "attention" },
  TATASTEEL: { pct: -4.0, vol: 2.7, tier: "attention" },
  MARUTI: { pct: 3.9, vol: 2.9, tier: "attention" },
  WIPRO: { pct: -2.8, vol: 1.9, tier: "worth_knowing" },
  HCLTECH: { pct: -2.5, vol: 1.8, tier: "worth_knowing" },
  LT: { pct: 2.2, vol: 1.7, tier: "worth_knowing" },
  ICICIBANK: { pct: -1.9, vol: 1.6, tier: "worth_knowing" },
  RELIANCE: { pct: 0.8, vol: 1.1, tier: "normal" },
  ITC: { pct: 0.2, vol: 0.8, tier: "normal" },
  HDFCBANK: { pct: -0.3, vol: 0.7, tier: "normal" },
  SBIN: { pct: 0.7, vol: 1.0, tier: "noise" },
  HINDUNILVR: { pct: -0.1, vol: 0.6, tier: "noise" },
};


/** Deterministic 0..1 pseudo-random so a symbol always looks the same. */
function seeded(symbol: string, salt: string): number {
  let h = 2166136261;
  const input = `${symbol}::${salt}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function basePrice(symbol: string): number {
  const r = seeded(symbol, "price");
  return Math.round((120 + r * 3200) * 100) / 100;
}

function round(value: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function classify(total: number): Classification {
  if (total >= 80) return "attention";
  if (total >= 60) return "worth_knowing";
  if (total >= 35) return "normal";
  return "noise";
}

function buildSpark(symbol: string, sinceLastSeenPct: number): number[] {
  const points: number[] = [];
  const start = 100;
  const end = 100 * (1 + sinceLastSeenPct / 100);
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const wobble = (seeded(symbol, `spark${i}`) - 0.5) * Math.abs(sinceLastSeenPct || 1) * 0.5;
    points.push(round(start + (end - start) * t + wobble, 3));
  }
  return points;
}

function scoreFor(input: {
  sinceLastSeenPct: number;
  volatilityMultiple: number;
  hoursAway: number;
  confidence: DataFreshness["confidence"];
  symbol: string;
}): ScoreBreakdown {
  const magnitude = Math.abs(input.sinceLastSeenPct);
  const priceMovement = clamp(Math.round(magnitude * 12));
  const volatilityAnomaly = clamp(Math.round((input.volatilityMultiple - 1) * 38));
  const timeRelevance = clamp(Math.round(30 + Math.min(input.hoursAway, 72) * 0.6));
  const userRelevance = clamp(55 + Math.round(seeded(input.symbol, "relevance") * 35));
  const dataConfidence =
    input.confidence === "high" ? 95 : input.confidence === "medium" ? 72 : 44;

  const total = clamp(
    Math.round(
      priceMovement * 0.32 +
        volatilityAnomaly * 0.3 +
        timeRelevance * 0.13 +
        userRelevance * 0.12 +
        dataConfidence * 0.13,
    ),
  );

  return { priceMovement, volatilityAnomaly, timeRelevance, userRelevance, dataConfidence, total };
}

function reasonsFor(q: {
  sinceLastSeenPct: number;
  volatilityMultiple: number;
  classification: Classification;
  confidence: DataFreshness["confidence"];
}): string[] {
  const dir = q.sinceLastSeenPct < 0 ? "dropped" : "rose";
  const out = [
    `Price ${dir} ${Math.abs(q.sinceLastSeenPct).toFixed(1)}% since your previous visit.`,
    `Movement is ${q.volatilityMultiple.toFixed(1)}× its recent normal volatility.`,
  ];
  if (q.classification === "attention") out.push("One of the largest movements in your watchlist.");
  out.push(
    q.confidence === "high"
      ? "Data confidence is high."
      : q.confidence === "medium"
        ? "Data is slightly delayed, confidence is moderate."
        : "Data confidence is low — this move is not marked as meaningful yet.",
  );
  return out;
}

function freshnessFor(scenario: DemoScenario, now: Date): DataFreshness {
  const iso = now.toISOString();
  if (scenario === "stale_data") {
    const last = new Date(now.getTime() - 35 * 60_000).toISOString();
    return { state: "stale", updatedAt: iso, lastReliableAt: last, confidence: "low" };
  }
  if (scenario === "conflicting_data") {
    const last = new Date(now.getTime() - 4 * 60_000).toISOString();
    return { state: "conflicting", updatedAt: iso, lastReliableAt: last, confidence: "low" };
  }
  if (scenario === "it_sector") {
    const last = new Date(now.getTime() - 7 * 60_000).toISOString();
    return { state: "delayed", updatedAt: last, lastReliableAt: last, confidence: "medium" };
  }
  return { state: "live", updatedAt: iso, lastReliableAt: iso, confidence: "high" };
}

function scenarioMove(
  scenario: DemoScenario,
  symbol: string,
): { pct: number; vol: number } | null {
  if (scenario === "unusual_drop") {
    if (symbol === "TATAMOTORS") return { pct: -6.2, vol: 3.4 };
    if (symbol === "TATASTEEL") return { pct: -2.4, vol: 1.6 };
  }
  if (scenario === "it_sector") {
    const map: Record<string, { pct: number; vol: number }> = {
      TCS: { pct: -3.2, vol: 2.1 },
      INFY: { pct: -4.1, vol: 2.4 },
      WIPRO: { pct: -2.8, vol: 1.9 },
      HCLTECH: { pct: -2.5, vol: 1.8 },
      TECHM: { pct: -2.2, vol: 1.7 },
    };
    return map[symbol] ?? null;
  }
  return null;
}

function awayLabel(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days} day${days === 1 ? "" : "s"}, ${remHours} hour${remHours === 1 ? "" : "s"}`;
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"}, ${minutes} minutes`;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export const demoMarketSource: MarketSource = {
  id: "demo",
  getBriefing({ symbols, lastCheckedAt, scenario }) {
    const now = new Date();
    const lastChecked = lastCheckedAt
      ? new Date(lastCheckedAt)
      : new Date(now.getTime() - 62 * 3_600_000);
    const hoursAway = (now.getTime() - lastChecked.getTime()) / 3_600_000;
    const freshness = freshnessFor(scenario, now);

    const quotes: Quote[] = symbols.map(({ symbol, name }) => {
      const forced = scenarioMove(scenario, symbol);
      const profile = scenario === "normal" ? DEMO_PORTFOLIO[symbol] : undefined;
      const drift = (seeded(symbol, `${scenario}-drift`) - 0.5) * 2.4;
      const sinceLastSeenPct = round(forced ? forced.pct : profile ? profile.pct : drift, 2);
      const volatilityMultiple = round(
        forced ? forced.vol : profile ? profile.vol : 0.6 + seeded(symbol, `${scenario}-vol`) * 0.9,
        2,
      );
      const price = round(basePrice(symbol));
      const lastSeenPrice = round(price / (1 + sinceLastSeenPct / 100));
      const dayChangePct = round(sinceLastSeenPct * (0.3 + seeded(symbol, "day") * 0.4), 2);

      const scores = scoreFor({
        sinceLastSeenPct,
        volatilityMultiple,
        hoursAway,
        confidence: freshness.confidence,
        symbol,
      });

      // Conflicting data must never be promoted to "needs attention".
      let classification = profile?.tier ?? classify(scores.total);
      if (scenario === "conflicting_data" && classification === "attention") {
        classification = "worth_knowing";
      }

      return {
        symbol,
        name,
        currency: "INR",
        price,
        lastSeenPrice,
        dayChangePct,
        sinceLastSeenPct,
        volatilityMultiple,
        classification,
        scores,
        spark: buildSpark(symbol, sinceLastSeenPct),
        reasons: reasonsFor({
          sinceLastSeenPct,
          volatilityMultiple,
          classification,
          confidence: freshness.confidence,
        }),
      };
    });

    const counts: AttentionCounts = quotes.reduce<AttentionCounts>(
      (acc, q) => {
        if (q.classification === "attention") acc.attention += 1;
        else if (q.classification === "worth_knowing") acc.worthKnowing += 1;
        else if (q.classification === "normal") acc.normal += 1;
        else acc.noise += 1;
        return acc;
      },
      { attention: 0, worthKnowing: 0, normal: 0, noise: 0 },
    );

    const patterns: Pattern[] = [];
    const itMembers = quotes.filter(
      (q) => IT_SYMBOLS.includes(q.symbol) && q.sinceLastSeenPct < -1,
    );
    if (itMembers.length >= 3) {
      patterns.push({
        id: "it-cluster",
        label: "Market pattern",
        headline: "Your IT stocks are moving together.",
        direction: "down",
        members: itMembers.map((m) => ({ symbol: m.symbol, name: m.name, pct: m.sinceLastSeenPct })),
        strength: clamp(60 + itMembers.length * 6),
        description: `${itMembers.length} stocks in your watchlist moved in the same direction.`,
      });
    }

    const replay: ReplayEvent[] = [];
    const sorted = [...quotes].sort(
      (a, b) => Math.abs(b.sinceLastSeenPct) - Math.abs(a.sinceLastSeenPct),
    );
    const step = Math.max(1, hoursAway / (sorted.length + 2));
    sorted.slice(0, 6).forEach((q, i) => {
      const at = new Date(lastChecked.getTime() + step * (i + 1) * 3_600_000).toISOString();
      const meaningful = q.classification === "attention";
      replay.push({
        id: `${q.symbol}-${i}`,
        at,
        symbol: q.symbol,
        kind: meaningful ? "meaningful" : "movement",
        title: `${q.name} ${q.sinceLastSeenPct < 0 ? "drops" : "rises"} ${Math.abs(q.sinceLastSeenPct).toFixed(1)}%`,
        detail: meaningful ? "Marked as meaningful" : undefined,
      });
    });
    if (patterns.length) {
      replay.push({
        id: "pattern-event",
        at: new Date(lastChecked.getTime() + hoursAway * 0.75 * 3_600_000).toISOString(),
        kind: "sector",
        title: "IT sector begins declining",
        detail: patterns[0]!.description,
      });
    }
    replay.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    const attentionLoad = counts.attention >= 4 ? "high" : counts.attention >= 2 ? "moderate" : "low";

    return {
      lastCheckedAt: lastChecked.toISOString(),
      awayLabel: awayLabel(lastChecked, now),
      counts,
      attentionLoad,
      freshness,
      quotes,
      patterns,
      replay,
    };
  },
};
