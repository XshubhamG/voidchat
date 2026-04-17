import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-muted bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent_0%,var(--muted-foreground)/5%_50%,transparent_100%)]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
