import { useState } from "react";
import { useWatchlists, useWatchlistStocks } from "@/lib/watchlist-queries";
import { useLastChecked, useMarketBriefing } from "@/lib/market/market-service";
import { isDemoSession } from "@/lib/demo-auth";

export function useActiveMarket() {
  const demo = isDemoSession();
  const [demoLastCheckedAt] = useState<string | null>(() => {
    if (typeof window === "undefined" || !demo) return null;
    const key = "delta.demo.lastCheckedAt";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const seeded = new Date(Date.now() - (2 * 24 + 14) * 3_600_000).toISOString();
    window.localStorage.setItem(key, seeded);
    return seeded;
  });
  const lists = useWatchlists();
  const active = lists.data?.[0];
  const stocks = useWatchlistStocks(active?.id);
  const last = useLastChecked();
  // A complete seeded portfolio keeps the demo populated and stable across reloads.
  const demoSymbols = [
    { symbol: "TATAMOTORS", name: "Tata Motors" }, { symbol: "TCS", name: "TCS" },
    { symbol: "INFY", name: "Infosys" }, { symbol: "WIPRO", name: "Wipro" },
    { symbol: "HCLTECH", name: "HCL Technologies" }, { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "ITC", name: "ITC" }, { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "SBIN", name: "State Bank of India" }, { symbol: "BAJFINANCE", name: "Bajaj Finance" },
    { symbol: "SUNPHARMA", name: "Sun Pharma" }, { symbol: "MARUTI", name: "Maruti Suzuki" },
    { symbol: "LT", name: "Larsen & Toubro" }, { symbol: "ICICIBANK", name: "ICICI Bank" },
    { symbol: "TATASTEEL", name: "Tata Steel" }, { symbol: "HINDUNILVR", name: "Hindustan Unilever" }
  ];
  const symbols = demo ? demoSymbols : (stocks.data ?? []).map(s => ({ symbol: s.symbol, name: s.instrument?.name ?? s.symbol }));
  const briefing = useMarketBriefing(symbols, demo ? demoLastCheckedAt : (last.data?.viewed_at ?? null));
  return { lists, active, stocks, last, briefing, symbols };
}
