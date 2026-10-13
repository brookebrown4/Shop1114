import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading text-lg font-semibold tracking-[0.2em] text-foreground",
        className,
      )}
    >
      SHOP1114
    </Link>
  );
}
