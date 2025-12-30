import { View } from "react-native";
import { Link } from "expo-router";
import { api } from "@/src/trpc/react";

import {
  ForgotPassword,
  ForgotPasswordContent,
  ForgotPasswordErrorMessage,
  ForgotPasswordFooter,
  ForgotPasswordForm,
  ForgotPasswordFormFields,
  ForgotPasswordSuccess,
} from "@tonik/auth-native/recipes/forgot-password";
import { Text } from "@tonik/ui-native";

export default function ForgotPasswordScreen() {
  const forgotPasswordMutation = api.auth.initPasswordReset.useMutation();

  return (
    <ForgotPassword
      mutate={forgotPasswordMutation.mutate}
      isPending={forgotPasswordMutation.isPending}
      error={forgotPasswordMutation.error}
      isSuccess={forgotPasswordMutation.isSuccess}
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-center text-3xl font-bold">
          Forgot Password
        </Text>
        <Text className="text-muted-foreground mb-8 text-center">
          Enter your email to receive a reset link
        </Text>

        <ForgotPasswordContent hideOnSuccess={true}>
          <ForgotPasswordErrorMessage />

          <ForgotPasswordForm>
            <ForgotPasswordFormFields />
          </ForgotPasswordForm>

          <ForgotPasswordFooter
            link={
              <Link href="/login" className="text-primary font-medium">
                Back to sign in
              </Link>
            }
          >
            Remember your password?{" "}
          </ForgotPasswordFooter>
        </ForgotPasswordContent>

        <ForgotPasswordSuccess>
          <View className="items-center">
            <Text className="mb-2 text-xl font-semibold">Check your email</Text>
            <Text className="text-muted-foreground text-center">
              We have sent a password reset link to your email
            </Text>
          </View>
        </ForgotPasswordSuccess>
      </View>
    </ForgotPassword>
  );
}
