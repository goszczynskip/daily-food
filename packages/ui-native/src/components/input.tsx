import type { StyleProp, TextInputProps, TextStyle } from "react-native";
import { forwardRef } from "react";
import { TextInput } from "react-native";

import { cn } from "../lib/utils";
import { useThemeVars } from "./theme-provider";

export interface InputProps extends TextInputProps {
  error?: boolean;
  className?: string;
}

const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, style, ...props }, ref) => {
    const { vars } = useThemeVars();
    return (
      <TextInput
        ref={ref}
        style={[vars as StyleProp<TextStyle>, style]}
        className={cn(
          "bg-background text-foreground h-10 rounded-md border px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus:border-ring focus:ring-ring/50 focus:ring-2",
          error &&
            "border-destructive focus:border-destructive focus:ring-destructive/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
