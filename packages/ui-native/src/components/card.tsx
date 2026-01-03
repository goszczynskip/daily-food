import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import { forwardRef } from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";
import { useThemeVars } from "./theme-provider";

export interface CardProps extends ViewProps {}

const Card = forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, style, ...props }, ref) => {
    const { vars } = useThemeVars();
    return (
      <View
        ref={ref}
        style={[vars as StyleProp<ViewStyle>, style]}
        className={cn("bg-card rounded-xl border p-6 shadow-sm", className)}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

const CardHeader = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn("px-6 pb-6", className)} {...props} />;
  },
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("text-xl font-semibold", className)}
        {...props}
      />
    );
  },
);

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<React.ElementRef<typeof View>, ViewProps>(
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

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn("px-6", className)} {...props} />;
  },
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn("flex flex-row items-center px-6 pt-6", className)}
        {...props}
      />
    );
  },
);

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
