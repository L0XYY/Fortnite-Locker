import { formatVBucks, cn } from "@/lib/utils";

/** V-Bucks amount with the official coin icon. */
export function VBucks({
  amount,
  className,
  strike,
}: {
  amount: number | null | undefined;
  className?: string;
  strike?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums", className)}>
      <VBucksCoin className="h-3.5 w-3.5" />
      <span className={cn(strike && "text-white/40 line-through")}>{formatVBucks(amount)}</span>
    </span>
  );
}

/** The real Fortnite V-Bucks icon (official asset, served locally). */
export function VBucksCoin({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/vbucks.png"
      alt="V-Bucks"
      width={20}
      height={20}
      className={cn("inline-block select-none object-contain", className)}
      draggable={false}
    />
  );
}
