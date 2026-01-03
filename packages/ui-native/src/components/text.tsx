import React from "react";
import type {
  TextProps as RNTextProps,
} from "react-native";
import { Text as RNText } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "text-3xl font-bold tracking-tight",
      h3: "text-2xl font-bold tracking-tight",
      h4: "text-xl font-bold tracking-tight",
      p: "text-base",
      lead: "text-muted-foreground text-xl",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TextProps extends RNTextProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "lead"
    | "large"
    | "small"
    | "muted";
  className?: string;
  ref?: React.Ref<RNText>;
}

const Text = ({ className, variant, ref, ...props }: TextProps) => {
  return (
    <RNText
      ref={ref}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
};

export { Text, textVariants };
