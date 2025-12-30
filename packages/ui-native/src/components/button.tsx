import type { PressableProps } from "react-native";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva("flex items-center justify-center rounded-md", {
  variants: {
    variant: {
      default: "bg-primary active:opacity-90",
      destructive: "bg-destructive active:opacity-90",
      outline: "border-input bg-background active:bg-accent border",
      secondary: "bg-secondary active:opacity-80",
      ghost: "active:bg-accent",
      link: "underline-offset-4",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps extends PressableProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    { className, variant, size, isLoading, disabled, children, ...props },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="currentColor" />
        ) : (
          <Text className={cn(buttonTextVariants({ variant }))}>
            {children}
          </Text>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
