import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, LogOut, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/useSession";
import {
  useAddStock,
  useCreateWatchlist,
  useDeleteWatchlist,
  useInstrumentSearch,
  useRemoveStock,
  useRenameWatchlist,
  useWatchlistStocks,
  useWatchlists,
} from "@/lib/watchlist-queries";

export const Route = createFileRoute("/_authenticated/watchlists")({
  head: () => ({
    meta: [
      { title: "Your watchlists — DELTA" },
      { name: "description", content: "Create watchlists and track the tickers you care about." },
      { property: "og:title", content: "Your watchlists — DELTA" },
      {
        property: "og:description",
        content: "Create watchlists and track the tickers you care about.",
      },
    ],
  }),
  component: WatchlistsPage,
});

function WatchlistsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: watchlists = [], isLoading } = useWatchlists();

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(
    () => watchlists.find((w) => w.id === activeId) ?? watchlists[0] ?? null,
    [watchlists, activeId],
  );

  useEffect(() => {
    if (!activeId && watchlists.length) setActiveId(watchlists[0]!.id);
    if (activeId && watchlists.length && !watchlists.some((w) => w.id === activeId)) {
      setActiveId(watchlists[0]!.id);
    }
  }, [watchlists, activeId]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-sm font-semibold tracking-[0.35em] text-primary">
            DELTA
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[280px_1fr]">
        <WatchlistSidebar
          watchlists={watchlists}
          isLoading={isLoading}
          activeId={active?.id ?? null}
          onSelect={setActiveId}
        />
        <StockPanel watchlistId={active?.id} watchlistName={active?.name} />
      </main>
    </div>
  );
}

function WatchlistSidebar({
  watchlists,
  isLoading,
  activeId,
  onSelect,
}: {
  watchlists: { id: string; name: string; is_default: boolean }[];
  isLoading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const create = useCreateWatchlist();
  const rename = useRenameWatchlist();
  const remove = useDeleteWatchlist();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <aside className="panel h-fit p-4">
      <p className="px-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">Watchlists</p>

      <ul className="mt-4 space-y-1">
        {isLoading && <li className="px-2 text-sm text-muted-foreground">Loading…</li>}
        {!isLoading && watchlists.length === 0 && (
          <li className="px-2 text-sm text-muted-foreground">No lists yet.</li>
        )}
        {watchlists.map((w) => {
          const isActive = w.id === activeId;
          if (editingId === w.id) {
            return (
              <li key={w.id} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-9"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Save name"
                  onClick={() => {
                    rename.mutate(
                      { id: w.id, name: editValue },
                      {
                        onSuccess: () => {
                          setEditingId(null);
                          toast.success("Watchlist renamed");
                        },
                        onError: (e) => toast.error((e as Error).message),
                      },
                    );
                  }}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Cancel rename"
                  onClick={() => setEditingId(null)}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          }
          return (
            <li key={w.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelect(w.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {w.name}
              </button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Rename ${w.name}`}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  setEditingId(w.id);
                  setEditValue(w.name);
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${w.name}`}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setPendingDelete(w.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          );
        })}
      </ul>

      <form
        className="mt-5 flex gap-2 border-t border-border/70 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(newName, {
            onSuccess: (w) => {
              setNewName("");
              onSelect(w.id);
              toast.success("Watchlist created");
            },
            onError: (err) => toast.error((err as Error).message),
          });
        }}
      >
        <Input
          placeholder="New watchlist"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-9"
        />
        <Button type="submit" size="icon" aria-label="Create watchlist" disabled={create.isPending}>
          {create.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </form>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              The list and its tickers are permanently removed. Your saved snapshots stay intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = pendingDelete!;
                setPendingDelete(null);
                remove.mutate(id, {
                  onSuccess: () => toast.success("Watchlist deleted"),
                  onError: (e) => toast.error((e as Error).message),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function StockPanel({
  watchlistId,
  watchlistName,
}: {
  watchlistId?: string;
  watchlistName?: string;
}) {
  const [term, setTerm] = useState("");
  const { data: stocks = [], isLoading } = useWatchlistStocks(watchlistId);
  const { data: results = [], isFetching } = useInstrumentSearch(term);
  const addStock = useAddStock(watchlistId);
  const removeStock = useRemoveStock(watchlistId);

  const owned = useMemo(() => new Set(stocks.map((s) => s.symbol)), [stocks]);

  function add(symbol: string) {
    addStock.mutate(symbol, {
      onSuccess: (sym) => {
        setTerm("");
        toast.success(`${sym} added to ${watchlistName ?? "your list"}`);
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {watchlistName ?? "No watchlist selected"}
        </h1>
        <span className="mono-nums text-sm text-muted-foreground">
          {stocks.length} {stocks.length === 1 ? "ticker" : "tickers"}
        </span>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search a ticker or company"
          className="pl-9"
          value={term}
          disabled={!watchlistId}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && term.trim()) {
              e.preventDefault();
              add(results[0]?.symbol ?? term);
            }
          }}
        />
        {term.trim() !== "" && (
          <div className="panel absolute z-20 mt-2 w-full overflow-hidden p-1">
            {isFetching && results.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">Searching…</p>
            )}
            {!isFetching && results.length === 0 && (
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => add(term)}
              >
                Add “{term.trim().toUpperCase()}” anyway
              </button>
            )}
            {results.map((r) => (
              <button
                key={r.symbol}
                disabled={owned.has(r.symbol)}
                onClick={() => add(r.symbol)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary disabled:opacity-40"
              >
                <span className="mono-nums font-medium">{r.symbol}</span>
                <span className="ml-4 truncate text-muted-foreground">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="mt-6 divide-y divide-border/60">
        {isLoading && <li className="py-4 text-sm text-muted-foreground">Loading tickers…</li>}
        {!isLoading && stocks.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            Nothing here yet. Search above to add your first ticker.
          </li>
        )}
        {stocks.map((s) => (
          <li key={s.id} className="group flex items-center justify-between py-3">
            <div>
              <p className="mono-nums text-sm font-medium">{s.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {s.instrument?.name ?? "Custom symbol"}
                {s.instrument?.exchange ? ` · ${s.instrument.exchange}` : ""}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${s.symbol}`}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() =>
                removeStock.mutate(s.id, {
                  onSuccess: () => toast.success(`${s.symbol} removed`),
                  onError: (e) => toast.error((e as Error).message),
                })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
