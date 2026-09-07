import { AlertTriangle } from "lucide-react";
import type { DataFreshness } from "@/lib/market/types";
import { cn } from "@/lib/utils";

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.max(0, Math.round(diff / 1000));
  if (secs < 20) return "just now";
  if (secs < 60) return `${secs} seconds ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export function DataStatus({
  freshness,
  className,
  compact = false,
}: {
  freshness: DataFreshness;
  className?: string;
  compact?: boolean;
}) {
  const { state, updatedAt, lastReliableAt } = freshness;

  if (state === "live") {
    return (
      <span className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-up/70" />
          <span className="relative inline-flex size-2 rounded-full bg-up" />
        </span>
        <span className="text-foreground">Live</span>
        {!compact && <span>· Updated {relative(updatedAt)}</span>}
      </span>
    );
  }

  if (state === "delayed") {
    return (
      <span className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <span className="size-2 rounded-full bg-amber-400/80" />
        <span className="text-foreground">Delayed</span>
        {!compact && <span>· Last reliable update {relative(lastReliableAt)}</span>}
      </span>
    );
  }

  if (state === "stale") {
    return (
      <span className={cn("flex items-center gap-2 text-xs text-amber-300/90", className)}>
        <AlertTriangle className="size-3.5" />
        <span>Data may be outdated</span>
        {!compact && (
          <span className="text-muted-foreground">
            · Last reliable update {relative(lastReliableAt)}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-2 text-xs text-amber-300/90", className)}>
      <AlertTriangle className="size-3.5" />
      <span>Data inconsistency detected</span>
    </span>
  );
}

export function ConflictNotice({ freshness }: { freshness: DataFreshness }) {
  if (freshness.state !== "conflicting") return null;
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-100/90">
      <p className="font-medium">We found conflicting market updates.</p>
      <p className="mt-1 text-amber-100/70">
        Nothing is being marked as meaningful until the data is verified.
      </p>
    </div>
  );
}
