import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, History, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DELTA — see what changed since you last looked" },
      {
        name: "description",
        content:
          "DELTA is a stock watchlist with Market Memory: it compares prices to what you last saw, not just the daily change.",
      },
      { property: "og:title", content: "DELTA — see what changed since you last looked" },
      {
        property: "og:description",
        content:
          "DELTA is a stock watchlist with Market Memory: it compares prices to what you last saw, not just the daily change.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-8">
        <span className="text-sm font-semibold tracking-[0.35em] text-primary">DELTA</span>
        {!loading &&
          (user ? (
            <Button asChild size="sm">
              <Link to="/overview">Open watchlists</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link to="/auth">Sign in</Link>
            </Button>
          ))}
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Market memory</p>
        <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          The market moved.
          <span className="block text-primary">Did anything change for you?</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Daily change resets at midnight. Your attention doesn&apos;t. DELTA remembers the last
          prices you actually saw and measures everything from there.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={user ? "/overview" : "/auth"}>
              {user ? "Open your watchlists" : "Create your account"}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {[
          {
            icon: History,
            title: "Anchored to you",
            body: "Every view is recorded as an immutable snapshot of what you saw and when.",
          },
          {
            icon: Eye,
            title: "Lists that persist",
            body: "Watchlists and tickers live in your account, synced across every session.",
          },
          {
            icon: ShieldCheck,
            title: "Yours alone",
            body: "Row-level security means your lists and history are readable only by you.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="panel p-6">
            <Icon className="size-5 text-primary" />
            <h2 className="mt-4 text-base font-medium">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
