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
  LoginOtpVerify,
  LoginOtpVerifyFields,
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
            {loginMutation.variables?.type === "otp-email" && (
              <View className="flex-1 justify-center">
                <Text className="mb-6 text-center text-2xl font-semibold">
                  Verify your email
                </Text>

                <LoginOtpVerify
                  email={loginMutation.variables.email}
                  messageId=""
                >
                  <LoginOtpVerifyFields />
                  <LoginButton type="otp-verify">Verify Code</LoginButton>

                  <View className="mt-4">
                    <Text className="text-muted-foreground text-center text-sm">
                      Didn&apos;t receive the code?
                    </Text>
                    <LoginButton type="otp-email" className="mt-2">
                      Resend Code
                    </LoginButton>
                  </View>
                </LoginOtpVerify>
              </View>
            )}
          </LoginSuccess>
        </View>
      </Login>
    </ScreenLayout>
  );
}
