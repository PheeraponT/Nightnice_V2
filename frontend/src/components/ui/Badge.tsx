import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "gold" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  default: "bg-night-lighter text-muted border border-white/10",
  primary: "bg-primary/15 text-primary-light border border-primary/30",
  secondary: "bg-accent/15 text-accent-light border border-accent/30",
  accent: "bg-accent/15 text-accent-light border border-accent/30",
  gold: "bg-gold/15 text-gold-light border border-gold/30",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  error: "bg-error/15 text-error border border-error/30",
};

const badgeSizes = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        "transition-all duration-300",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
