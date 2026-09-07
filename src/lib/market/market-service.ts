import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { demoMarketSource } from "./demo-source";
import { useDemoMode } from "./demo-mode";
import type { MarketBriefing, MarketSource, Quote } from "./types";

/**
 * The single place where DELTA decides where market numbers come from.
 * Swap this for a live source once price ingestion + the Meaningfulness
 * Engine exist; the hooks below and every component keep working.
 */
const activeSource: MarketSource = demoMarketSource;
export const isDemoSource = activeSource.id === "demo";

/** Real data: the last snapshot this user recorded (their "market memory"). */
export function useLastChecked() {
  return useQuery({
    queryKey: ["last-snapshot"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_market_snapshots")
        .select("id, viewed_at, watchlist_id")
        .order("viewed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMarketBriefing(
  symbols: { symbol: string; name: string }[],
  lastCheckedAt: string | null,
) {
  const { scenario } = useDemoMode();
  const key = symbols.map((s) => s.symbol).join(",");

  const query = useQuery({
    queryKey: ["briefing", scenario, key, lastCheckedAt ?? "never"],
    // Re-evaluated on an interval so the UI behaves like a live feed today and
    // can be replaced by a realtime subscription later without UI changes.
    refetchInterval: 20_000,
    queryFn: async (): Promise<MarketBriefing> =>
      activeSource.getBriefing({ symbols, lastCheckedAt, scenario }),
  });

  return query;
}

export function useQuoteMap(quotes: Quote[] | undefined) {
  return useMemo(() => {
    const map = new Map<string, Quote>();
    (quotes ?? []).forEach((q) => map.set(q.symbol, q));
    return map;
  }, [quotes]);
}

/**
 * Records what the user just saw. Writes to the immutable snapshot tables so
 * the next visit can be measured against this exact moment.
 */
export function useRecordSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      watchlistId,
      quotes,
    }: {
      watchlistId: string | null;
      quotes: Quote[];
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("You need to be signed in.");
      const userId = userData.user.id;

      const { data: snapshot, error } = await supabase
        .from("user_market_snapshots")
        .insert({ user_id: userId, watchlist_id: watchlistId })
        .select("id, viewed_at")
        .single();
      if (error) throw error;

      if (quotes.length) {
        const { error: statesError } = await supabase.from("snapshot_stock_states").insert(
          quotes.map((q) => ({
            snapshot_id: snapshot.id,
            user_id: userId,
            symbol: q.symbol,
            price: q.price,
            market_timestamp: new Date().toISOString(),
          })),
        );
        if (statesError) throw statesError;
      }
      return snapshot;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["last-snapshot"] });
      qc.invalidateQueries({ queryKey: ["briefing"] });
    },
  });
}

export function formatMoney(value: number, currency: "INR" | "USD" = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
