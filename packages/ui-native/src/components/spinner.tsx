import type { VariantProps } from "class-variance-authority";
import type { ActivityIndicatorProps } from "react-native";
import { forwardRef } from "react";
import { ActivityIndicator } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

const spinnerVariants = cva("", {
  variants: {
    size: {
      default: "h-6 w-6",
      sm: "h-4 w-4",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface SpinnerProps extends Omit<ActivityIndicatorProps, "size"> {
  size?: "default" | "sm" | "lg";
  className?: string;
}

const Spinner = forwardRef<ActivityIndicator, SpinnerProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <ActivityIndicator
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        size={size === "lg" ? "large" : size === "sm" ? "small" : "small"}
        {...props}
      />
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner };
