import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  default: "bg-muted/20 text-muted",
  primary: "bg-primary/20 text-primary",
  secondary: "bg-secondary/20 text-secondary",
  accent: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  error: "bg-error/20 text-error",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
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
        "transition-colors duration-200",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
