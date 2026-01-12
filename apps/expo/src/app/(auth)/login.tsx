import { View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
import { Redirect } from "expo-router";
import { useTrpc } from "@/src/trpc/react";

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
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const trpc = useTrpc()
  const { t } = useTranslation("auth")
  const loginMutation = useMutation(trpc.auth.login.mutationOptions());
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
          <Text className="mb-2 text-center text-3xl font-bold">{t('title-welcome')}</Text>
          <Text className="text-muted-foreground mb-8 text-center">
            {t('subtitle-sign-in')}
          </Text>

          <LoginSocial>
            <LoginSocialApple />
            <LoginSocialGoogle onPress={() => console.log("google")} />
          </LoginSocial>

          <LoginSectionSplitter text={t("or")} />

          <LoginOtpEmail>
            <LoginOtpEmailFields
              labelText={t('form.email.label')}
              placeholder={t("form.email.placeholder")}
            />
            <LoginButton type="otp-email">{t('form.submit.login-via-email')}</LoginButton>
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
