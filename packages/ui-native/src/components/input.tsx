import type { TextInputProps } from "react-native";
import React from "react";
import { TextInput } from "react-native";

import { cn } from "../lib/utils";

export interface InputProps extends TextInputProps {
  error?: boolean;
  className?: string;
  ref?: React.Ref<TextInput>;
}

const Input = ({ className, error, ref, ...props }: InputProps) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "bg-background text-foreground h-10 rounded-md border px-3 py-2 text-sm leading-none",
        "placeholder:text-muted-foreground",
        "focus:border-ring focus:ring-ring/50 focus:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "border-destructive focus:border-destructive focus:ring-destructive/20":
            error,
        },
        className,
      )}
      {...props}
    />
  );
};

export { Input };
