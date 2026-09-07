import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { symbolSchema, watchlistNameSchema } from "./schemas";

export type Watchlist = {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
};

export type WatchlistStock = {
  id: string;
  symbol: string;
  added_at: string;
  instrument: { name: string; exchange: string | null } | null;
};

export type Instrument = {
  symbol: string;
  name: string;
  exchange: string | null;
};

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user.id;
}

export const watchlistKeys = {
  all: ["watchlists"] as const,
  stocks: (watchlistId: string) => ["watchlist-stocks", watchlistId] as const,
  search: (term: string) => ["instrument-search", term] as const,
};

export function useWatchlists() {
  return useQuery({
    queryKey: watchlistKeys.all,
    queryFn: async (): Promise<Watchlist[]> => {
      const { data, error } = await supabase
        .from("watchlists")
        .select("id, name, is_default, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWatchlistStocks(watchlistId: string | undefined) {
  return useQuery({
    queryKey: watchlistKeys.stocks(watchlistId ?? "none"),
    enabled: Boolean(watchlistId),
    queryFn: async (): Promise<WatchlistStock[]> => {
      const { data, error } = await supabase
        .from("watchlist_stocks")
        .select("id, symbol, added_at, instrument:instruments(name, exchange)")
        .eq("watchlist_id", watchlistId!)
        .order("added_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as WatchlistStock[];
    },
  });
}

export function useInstrumentSearch(term: string) {
  const query = term.trim();
  return useQuery({
    queryKey: watchlistKeys.search(query.toUpperCase()),
    enabled: query.length > 0,
    queryFn: async (): Promise<Instrument[]> => {
      const { data, error } = await supabase
        .from("instruments")
        .select("symbol, name, exchange")
        .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
        .order("symbol", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rawName: string) => {
      const name = watchlistNameSchema.parse(rawName);
      const user_id = await requireUserId();
      const { data, error } = await supabase
        .from("watchlists")
        .insert({ name, user_id })
        .select("id, name, is_default, created_at")
        .single();
      if (error) throw error;
      return data as Watchlist;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: watchlistKeys.all }),
  });
}

export function useRenameWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const parsed = watchlistNameSchema.parse(name);
      const { error } = await supabase.from("watchlists").update({ name: parsed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: watchlistKeys.all }),
  });
}

export function useDeleteWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: watchlistKeys.all }),
  });
}

export function useAddStock(watchlistId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rawSymbol: string) => {
      if (!watchlistId) throw new Error("Pick a watchlist first.");
      const symbol = symbolSchema.parse(rawSymbol);
      const user_id = await requireUserId();
      const { error } = await supabase
        .from("watchlist_stocks")
        .insert({ watchlist_id: watchlistId, symbol, user_id });
      if (error) {
        if (error.code === "23505") throw new Error(`${symbol} is already on this list.`);
        throw error;
      }
      return symbol;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: watchlistKeys.stocks(watchlistId ?? "none") }),
  });
}

export function useRemoveStock(watchlistId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watchlist_stocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: watchlistKeys.stocks(watchlistId ?? "none") }),
  });
}
