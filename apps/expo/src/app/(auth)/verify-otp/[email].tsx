import { Text, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { trpc } from "@/src/trpc/react";
import { useMutation } from "@tanstack/react-query";

import {
  Login,
  LoginButton,
  LoginContent,
  LoginErrorMessage,
  LoginOtpVerify,
  LoginOtpVerifyFields,
  LoginSuccess,
} from "@tonik/auth-native/recipes/login";

function VerifyOTPPage() {
  const { email } = useLocalSearchParams<{
    email: string;
  }>();
  const loginMutation = useMutation(trpc.auth.login.mutationOptions());

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <View className="flex-1 justify-center">
        <LoginContent>
          <Text className="mb-2 text-center text-3xl font-bold">Welcome</Text>
          <Text className="text-muted-foreground mb-8 text-center">
            Sign in to continue
          </Text>

          <LoginOtpVerify email={email}>
            <LoginOtpVerifyFields />
            <LoginButton type="otp-verify">Verify code</LoginButton>
          </LoginOtpVerify>

          <LoginErrorMessage />
        </LoginContent>

        <LoginSuccess type="otp-verify">
          <Redirect href={`/(app)`} />
        </LoginSuccess>
      </View>
    </Login>
  );
}

export default VerifyOTPPage;
