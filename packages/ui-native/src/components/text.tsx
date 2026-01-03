import type { VariantProps } from "class-variance-authority";
import type {
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { forwardRef } from "react";
import { Text as RNText } from "react-native";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";
import { useThemeVars } from "./theme-provider";

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
}

const Text = forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, style, ...props }, ref) => {
    const { vars } = useThemeVars();
    return (
      <RNText
        ref={ref}
        style={[vars as StyleProp<TextStyle>, style]}
        className={cn(textVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Text.displayName = "Text";

export { Text, textVariants };
