import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  text?: string;
}

export function LoadingIndicator({ className, text = "Loading..." }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2 p-4", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
