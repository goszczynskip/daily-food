import type { TextInputProps } from "react-native";
import { forwardRef } from "react";
import { TextInput } from "react-native";

import { cn } from "../lib/utils";

export interface InputProps extends TextInputProps {
  error?: boolean;
  className?: string;
}

const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "bg-background h-10 rounded-md border px-3 py-2 text-sm",
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
