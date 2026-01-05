import { View } from "react-native";
import { Redirect } from "expo-router";
import { api } from "@/src/trpc/react";

import { useAuthStore } from "@tonik/auth-native";
import {
  Login,
  LoginButton,
  LoginContent,
  LoginErrorMessage,
  LoginOtpEmail,
  LoginOtpEmailFields,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialApple,
  LoginSocialGoogle,
  LoginSuccess,
} from "@tonik/auth-native/recipes/login";
import { Text } from "@tonik/ui-native";
import { ScreenLayout } from "@tonik/ui-native/recipes/screen";

export default function LoginScreen() {
  const loginMutation = api.auth.login.useMutation();
  const isAuthenticated = useAuthStore((s) => s.state === "authenticated");

  // Redirect to app if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <ScreenLayout>
      <Login
        mutate={loginMutation.mutate}
        isPending={loginMutation.isPending}
        error={loginMutation.error}
        isSuccess={loginMutation.isSuccess}
        variables={loginMutation.variables}
      >
        <View className="flex-1 justify-center">
          <LoginContent hideOnSuccess="otp-email">
            <Text className="mb-2 text-center text-3xl font-bold">Welcome</Text>
            <Text className="text-muted-foreground mb-8 text-center">
              Sign in to continue
            </Text>

            <LoginSocial>
              <LoginSocialApple />
              <LoginSocialGoogle onPress={() => console.log("google")} />
            </LoginSocial>

            <LoginSectionSplitter />

            <LoginOtpEmail>
              <LoginOtpEmailFields />
              <LoginButton type="otp-email">Login via email</LoginButton>
            </LoginOtpEmail>

            <LoginErrorMessage />
          </LoginContent>

          <LoginSuccess type="otp-email">
            <Text className="mb-2 text-xl font-semibold">Check your email</Text>
            <Text className="text-muted-foreground text-center">
              We&apos;ve sent a login link to your email
            </Text>
          </LoginSuccess>
        </View>
      </Login>
    </ScreenLayout>
  );
}
