import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { createContext, useContext, useMemo } from "react";
import { useColorScheme, View } from "react-native";

import { CSS_VARS } from "../theme";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  vars: (typeof CSS_VARS)["light"];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that provides CSS variables for theming.
 *
 * NativeWind v5 doesn't support `.dark` class selectors for CSS variable switching
 * on native platforms. This provider uses React Context to pass theme variables
 * to all descendant components.
 *
 * Components should use the `useThemeVars` hook to access the current theme's
 * CSS variables and apply them via the style prop.
 *
 * @see https://github.com/nativewind/react-native-css/issues/255
 */
export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme: Theme = colorScheme === "dark" ? "dark" : "light";

  const value = useMemo(
    () => ({
      theme,
      vars: CSS_VARS[theme],
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View
        style={CSS_VARS[theme] as StyleProp<ViewStyle>}
        className="bg-background flex-1"
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme's CSS variables.
 * Must be used within a ThemeProvider.
 *
 * @returns Object containing the current theme name and vars() style object
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { vars } = useThemeVars();
 *   return <Text style={vars} className="text-foreground">Hello</Text>;
 * }
 * ```
 */
export function useThemeVars(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeVars must be used within a ThemeProvider");
  }
  return context;
}
