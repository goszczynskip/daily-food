import type { ReactNode } from "react";
import React from "react";
import { ScrollView } from "react-native";

import { cn } from "../lib/utils";

interface ScreenLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ScreenLayout = ({
  children,
  className,
  ...rest
}: ScreenLayoutProps) => {
  return (
    <ScrollView
      className={cn(
        "bg-background text-foreground h-full px-6",
        className,
      )}
      contentContainerClassName="flex flex-grow justify-center w-full max-w-md py-12"
      {...rest}
    >
      {children}
    </ScrollView>
  );
};
