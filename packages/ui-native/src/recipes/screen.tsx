import React from "react"
import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "../lib/utils";

interface ScreenLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ScreenLayout = ({ children, className, ...rest }: ScreenLayoutProps) => {
  return <View className={cn("bg-background text-foreground h-full px-6", className)} {...rest}>{children}</View>;
};
