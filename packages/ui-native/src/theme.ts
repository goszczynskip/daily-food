import type { Theme } from "@react-navigation/native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

// CSS variable values for light and dark themes
const LIGHT_COLORS = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.145 0 0)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0 0)",
  primary: "oklch(0.205 0 0)",
  primaryForeground: "oklch(0.985 0 0)",
  secondary: "oklch(0.97 0 0)",
  secondaryForeground: "oklch(0.205 0 0)",
  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.556 0 0)",
  accent: "oklch(0.97 0 0)",
  accentForeground: "oklch(0.205 0 0)",
  destructive: "oklch(0.577 0.245 27.325)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.708 0 0)",
};

const DARK_COLORS = {
  background: "oklch(0.145 0 0)",
  foreground: "oklch(0.985 0 0)",
  card: "oklch(0.145 0 0)",
  cardForeground: "oklch(0.985 0 0)",
  popover: "oklch(0.145 0 0)",
  popoverForeground: "oklch(0.985 0 0)",
  primary: "oklch(0.985 0 0)",
  primaryForeground: "oklch(0.205 0 0)",
  secondary: "oklch(0.269 0 0)",
  secondaryForeground: "oklch(0.985 0 0)",
  muted: "oklch(0.269 0 0)",
  mutedForeground: "oklch(0.708 0 0)",
  accent: "oklch(0.269 0 0)",
  accentForeground: "oklch(0.985 0 0)",
  destructive: "oklch(0.396 0.141 25.723)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.269 0 0)",
  input: "oklch(0.269 0 0)",
  ring: "oklch(0.439 0 0)",
};

/**
 * Theme objects for VariableContextProvider.
 * These provide CSS custom properties that override the defaults in globals.css.
 *
 * @see https://github.com/nativewind/react-native-css/issues/248#issuecomment-3629819439
 */
export const LIGHT_THEME = {
  "--color-background": LIGHT_COLORS.background,
  "--color-foreground": LIGHT_COLORS.foreground,
  "--color-card": LIGHT_COLORS.card,
  "--color-card-foreground": LIGHT_COLORS.cardForeground,
  "--color-popover": LIGHT_COLORS.popover,
  "--color-popover-foreground": LIGHT_COLORS.popoverForeground,
  "--color-primary": LIGHT_COLORS.primary,
  "--color-primary-foreground": LIGHT_COLORS.primaryForeground,
  "--color-secondary": LIGHT_COLORS.secondary,
  "--color-secondary-foreground": LIGHT_COLORS.secondaryForeground,
  "--color-muted": LIGHT_COLORS.muted,
  "--color-muted-foreground": LIGHT_COLORS.mutedForeground,
  "--color-accent": LIGHT_COLORS.accent,
  "--color-accent-foreground": LIGHT_COLORS.accentForeground,
  "--color-destructive": LIGHT_COLORS.destructive,
  "--color-destructive-foreground": LIGHT_COLORS.destructiveForeground,
  "--color-border": LIGHT_COLORS.border,
  "--color-input": LIGHT_COLORS.input,
  "--color-ring": LIGHT_COLORS.ring,
};

export const DARK_THEME = {
  "--color-background": DARK_COLORS.background,
  "--color-foreground": DARK_COLORS.foreground,
  "--color-card": DARK_COLORS.card,
  "--color-card-foreground": DARK_COLORS.cardForeground,
  "--color-popover": DARK_COLORS.popover,
  "--color-popover-foreground": DARK_COLORS.popoverForeground,
  "--color-primary": DARK_COLORS.primary,
  "--color-primary-foreground": DARK_COLORS.primaryForeground,
  "--color-secondary": DARK_COLORS.secondary,
  "--color-secondary-foreground": DARK_COLORS.secondaryForeground,
  "--color-muted": DARK_COLORS.muted,
  "--color-muted-foreground": DARK_COLORS.mutedForeground,
  "--color-accent": DARK_COLORS.accent,
  "--color-accent-foreground": DARK_COLORS.accentForeground,
  "--color-destructive": DARK_COLORS.destructive,
  "--color-destructive-foreground": DARK_COLORS.destructiveForeground,
  "--color-border": DARK_COLORS.border,
  "--color-input": DARK_COLORS.input,
  "--color-ring": DARK_COLORS.ring,
};

// Legacy THEME export for backwards compatibility
export const THEME = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
};

// React Navigation theme configuration
export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: LIGHT_COLORS.background,
      border: LIGHT_COLORS.border,
      card: LIGHT_COLORS.card,
      notification: LIGHT_COLORS.destructive,
      primary: LIGHT_COLORS.primary,
      text: LIGHT_COLORS.foreground,
    },
    fonts: {
      bold: { fontFamily: "Geist-Medium", fontWeight: "500" },
      medium: { fontFamily: "Geist-Medium", fontWeight: "500" },
      regular: { fontFamily: "Geist", fontWeight: "400" },
      heavy: { fontFamily: "Geist-SemiBold", fontWeight: "600" },
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: DARK_COLORS.background,
      border: DARK_COLORS.border,
      card: DARK_COLORS.card,
      notification: DARK_COLORS.destructive,
      primary: DARK_COLORS.primary,
      text: DARK_COLORS.foreground,
    },
    fonts: {
      bold: { fontFamily: "Geist-Medium", fontWeight: "500" },
      medium: { fontFamily: "Geist-Medium", fontWeight: "500" },
      regular: { fontFamily: "Geist", fontWeight: "400" },
      heavy: { fontFamily: "Geist-SemiBold", fontWeight: "600" },
    },
  },
};
