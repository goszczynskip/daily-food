import "../global.css";

import { Redirect, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";

import "react-native-reanimated";

import * as SecureStore from "expo-secure-store";
import { SplashScreenController } from "@/src/components/splash";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { TRPCReactProvider } from "@/src/trpc/react";
import { PortalHost } from "@rn-primitives/portal";

import {
  SecureStorage,
  SessionProvider,
  useAuthStore,
} from "@tonik/auth-native";
import { ThemeProvider } from "@tonik/ui-native";
import { ScreenLayout } from "@tonik/ui-native/recipes/screen";
import { NAV_THEME } from "@tonik/ui-native/theme";

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? "light";
  const authState = useAuthStore((s) => s.state);

  // Show nothing while loading auth state (splash screen handles this)
  if (authState === "loading") {
    return null;
  }

  return (
    <NavigationThemeProvider value={NAV_THEME[colorScheme]}>
      <ThemeProvider>
        {authState !== "authenticated" && <Redirect href="/(auth)/login" />}
        <StatusBar style="dark" />
        <ScreenLayout>
          <Slot />
        </ScreenLayout>
        <PortalHost />
      </ThemeProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const storage: SecureStorage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
  };

  return (
    <SessionProvider storage={storage}>
      <TRPCReactProvider>
        <SplashScreenController />
        <RootLayoutNav />
      </TRPCReactProvider>
    </SessionProvider>
  );
}
