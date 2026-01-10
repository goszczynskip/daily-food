import { SplashScreen } from "expo-router";

import { useAuthStore } from "@tonik/auth-native";

import { useLocaleStore } from "../i18n/provider";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const isLoading = useAuthStore((s) => s.state === "loading");
  const isLocaleSet = useLocaleStore((s) => s.state !== "hydrated");

  if (!isLoading && isLocaleSet) {
    SplashScreen.hide();
  }

  return null;
}
