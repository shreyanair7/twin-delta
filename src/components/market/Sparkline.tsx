import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  direction,
  className,
  width = 120,
  height = 32,
}: {
  points: number[];
  direction: "up" | "down" | "flat";
  className?: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);

  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / span) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const stroke =
    direction === "up"
      ? "var(--color-up)"
      : direction === "down"
        ? "var(--color-down)"
        : "var(--color-muted-foreground)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
