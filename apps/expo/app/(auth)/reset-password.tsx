import { View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/src/providers/auth-provider";
import { api } from "@/src/trpc/react";

import {
  ResetPassword,
  ResetPasswordContent,
  ResetPasswordErrorMessage,
  ResetPasswordFooter,
  ResetPasswordForm,
  ResetPasswordFormFields,
  ResetPasswordSuccess,
} from "@tonik/auth-native/recipes/reset-password";
import { Text } from "@tonik/ui-native";

export default function ResetPasswordScreen() {
  const resetPasswordMutation = api.auth.resetPassword.useMutation();
  const { refreshSession } = useAuth();

  return (
    <ResetPassword
      mutate={resetPasswordMutation.mutate}
      isPending={resetPasswordMutation.isPending}
      error={resetPasswordMutation.error}
      isSuccess={resetPasswordMutation.isSuccess}
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-center text-3xl font-bold">
          Reset Password
        </Text>
        <Text className="text-muted-foreground mb-8 text-center">
          Enter your new password
        </Text>

        <ResetPasswordContent hideOnSuccess={true}>
          <ResetPasswordErrorMessage />

          <ResetPasswordForm>
            <ResetPasswordFormFields />
          </ResetPasswordForm>

          <ResetPasswordSuccess>
            <View className="items-center">
              <Text className="mb-2 text-xl font-semibold">Password reset</Text>
              <Text className="text-muted-foreground text-center">
                Your password has been reset successfully
              </Text>
              <Link href="/(tabs)" className="text-primary mt-4 font-medium">
                Go to home
              </Link>
            </View>
          </ResetPasswordSuccess>
        </ResetPasswordContent>
      </View>
    </ResetPassword>
  );
}
