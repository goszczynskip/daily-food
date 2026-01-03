import type { VariantProps } from "class-variance-authority";
import type { ViewProps } from "react-native";
import { forwardRef } from "react";
import { View } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive:
        "border-destructive/50 bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface AlertProps extends ViewProps, VariantProps<typeof alertVariants> {}

const Alert = forwardRef<React.ElementRef<typeof View>, AlertProps>(
  ({ className, variant, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={style}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Alert.displayName = "Alert";

const AlertTitle = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("mb-1 font-medium", className)}
        {...props}
      />
    );
  },
);

AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
      />
    );
  },
);

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
