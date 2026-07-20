import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  sub,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("glass relative overflow-hidden rounded-3xl p-5", className)}>
      {accent && (
        <div
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
          style={{ background: accent, opacity: 0.35 }}
        />
      )}
      <p className="text-xs font-medium uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({
  active,
  children,
  onClick,
  style,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95",
        active
          ? "border-white bg-white text-ink-950"
          : "border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
