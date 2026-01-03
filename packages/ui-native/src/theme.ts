import type { Theme } from "@react-navigation/native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { vars } from "nativewind";

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

// CSS variables for theming - these inject CSS custom properties at runtime via vars()
// eslint-disable-next-line @typescript-eslint/no-deprecated
export const CSS_VARS = {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  light: vars({
    "--background": LIGHT_COLORS.background,
    "--foreground": LIGHT_COLORS.foreground,
    "--card": LIGHT_COLORS.card,
    "--card-foreground": LIGHT_COLORS.cardForeground,
    "--popover": LIGHT_COLORS.popover,
    "--popover-foreground": LIGHT_COLORS.popoverForeground,
    "--primary": LIGHT_COLORS.primary,
    "--primary-foreground": LIGHT_COLORS.primaryForeground,
    "--secondary": LIGHT_COLORS.secondary,
    "--secondary-foreground": LIGHT_COLORS.secondaryForeground,
    "--muted": LIGHT_COLORS.muted,
    "--muted-foreground": LIGHT_COLORS.mutedForeground,
    "--accent": LIGHT_COLORS.accent,
    "--accent-foreground": LIGHT_COLORS.accentForeground,
    "--destructive": LIGHT_COLORS.destructive,
    "--destructive-foreground": LIGHT_COLORS.destructiveForeground,
    "--border": LIGHT_COLORS.border,
    "--input": LIGHT_COLORS.input,
    "--ring": LIGHT_COLORS.ring,
  }),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  dark: vars({
    "--background": DARK_COLORS.background,
    "--foreground": DARK_COLORS.foreground,
    "--card": DARK_COLORS.card,
    "--card-foreground": DARK_COLORS.cardForeground,
    "--popover": DARK_COLORS.popover,
    "--popover-foreground": DARK_COLORS.popoverForeground,
    "--primary": DARK_COLORS.primary,
    "--primary-foreground": DARK_COLORS.primaryForeground,
    "--secondary": DARK_COLORS.secondary,
    "--secondary-foreground": DARK_COLORS.secondaryForeground,
    "--muted": DARK_COLORS.muted,
    "--muted-foreground": DARK_COLORS.mutedForeground,
    "--accent": DARK_COLORS.accent,
    "--accent-foreground": DARK_COLORS.accentForeground,
    "--destructive": DARK_COLORS.destructive,
    "--destructive-foreground": DARK_COLORS.destructiveForeground,
    "--border": DARK_COLORS.border,
    "--input": DARK_COLORS.input,
    "--ring": DARK_COLORS.ring,
  }),
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
