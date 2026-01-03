import { SplashScreen } from 'expo-router';
import { useAuthStore } from '@tonik/auth-native';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const isLoading = useAuthStore(s => s.state === "loading");

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}
