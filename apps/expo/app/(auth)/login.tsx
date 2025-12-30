import { View } from "react-native";
import { useAuth } from "@/src/providers/auth-provider";
import { api } from "@/src/trpc/react";

import {
  Login,
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

          <LoginOtpEmail>
            <LoginOtpEmailFields />
          </LoginOtpEmail>

          <LoginErrorMessage />
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
