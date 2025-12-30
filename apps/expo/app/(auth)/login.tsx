import { View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/src/providers/auth-provider";
import { api } from "@/src/trpc/react";

import {
  Login,
  LoginContent,
  LoginErrorMessage,
  LoginFooter,
  LoginOtpEmail,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialApple,
  LoginSocialGoogle,
  LoginSuccess,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
} from "@tonik/auth-native/recipes/login";
import { Text } from "@tonik/ui-native";

export default function LoginScreen() {
  const loginMutation = api.auth.login.useMutation();
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-center text-3xl font-bold">Welcome</Text>
        <Text className="text-muted-foreground mb-8 text-center">
          Sign in to continue
        </Text>

        <LoginContent hideOnSuccess="otp-email">
          <LoginSocial>
            <LoginSocialApple onPress={signInWithApple} />
            <LoginSocialGoogle onPress={signInWithGoogle} />
          </LoginSocial>

          <LoginSectionSplitter />

          <LoginErrorMessage />

          <LoginUsernamePassword>
            <LoginUsernamePasswordFields
              forgotPasswordLink={
                <Link href="/forgot-password" className="text-primary text-sm">
                  Forgot password?
                </Link>
              }
            />
          </LoginUsernamePassword>

          <LoginSectionSplitter />

          <LoginOtpEmail>
            <View className="gap-4">
              <Text className="text-sm font-medium">Email</Text>
              <View className="gap-2">
                <Text className="text-muted-foreground text-sm">
                  Or sign in with a magic link
                </Text>
                <Text className="text-primary text-sm">Send magic link</Text>
              </View>
            </View>
          </LoginOtpEmail>

          <LoginFooter
            link={
              <Link href="/signup" className="text-primary font-medium">
                Create one
              </Link>
            }
          >
            Don't have an account?{" "}
          </LoginFooter>
        </LoginContent>

        <LoginSuccess type="otp-email">
          <Text className="mb-2 text-xl font-semibold">Check your email</Text>
          <Text className="text-muted-foreground text-center">
            We've sent a login link to your email
          </Text>
        </LoginSuccess>
      </View>
    </Login>
  );
}
