import type { ReactNode } from "react";
import { useColorScheme, View } from "react-native";
import { VariableContextProvider } from "nativewind";

import { DARK_THEME, LIGHT_THEME } from "../theme";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that provides CSS variables for theming.
 *
 * Uses NativeWind's VariableContextProvider to inject CSS custom properties
 * that override the defaults in globals.css. All child components automatically
 * inherit these theme variables without needing explicit style props.
 *
 * @see https://github.com/nativewind/react-native-css/issues/248#issuecomment-3629819439
 */
export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;

  return (
    <VariableContextProvider value={theme}>
      <View className="bg-background flex-1">{children}</View>
    </VariableContextProvider>
  );
}
