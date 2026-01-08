import { View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
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

export default function LoginScreen() {
  const loginMutation = api.auth.login.useMutation();
  const isAuthenticated = useAuthStore((s) => s.state === "authenticated");

  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      justifyContent: "center",
      transform: [
        {
          translateY: withTiming(-keyboard.height.value / 3, {
            easing: Easing.linear,
            duration: 100
          }),
        },
      ],
    };
  });

  // Redirect to app if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  const encodedEmail =
    loginMutation.variables?.type === "otp-email"
      ? encodeURIComponent(loginMutation.variables.email)
      : null;

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <Animated.View style={animatedStyle}>
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
          {encodedEmail ? (
            <Redirect href={`/(auth)/verify-otp/${encodedEmail}`} />
          ) : (
            <View>
              <Text>Something went wrong</Text>
            </View>
          )}
        </LoginSuccess>
      </Animated.View>
    </Login>
  );
}
