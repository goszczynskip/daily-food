import type { ViewProps } from "react-native";
import { forwardRef } from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";

export interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
}

const Separator = forwardRef<React.ElementRef<typeof View>, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          "bg-border",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";

export { Separator };
