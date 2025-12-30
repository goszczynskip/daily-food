import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { resetPasswordRequestSchema } from "@tonik/auth/schemas";
import { Alert, Button, Input, Text } from "@tonik/ui-native";

import type { ResetPasswordContextValue } from "../types";

const ResetPasswordContext = createContext<ResetPasswordContextValue | null>(
  null,
);

const useResetPasswordContext = () => {
  const ctx = useContext(ResetPasswordContext);
  if (!ctx)
    throw new Error(
      "ResetPassword components must be used within <ResetPassword>",
    );
  return ctx;
};

export function ResetPassword({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
}: ResetPasswordContextValue & { children: ReactNode }) {
  return (
    <ResetPasswordContext.Provider
      value={{ mutate, isPending, error, isSuccess }}
    >
      <View className="bg-background flex-1 p-6">{children}</View>
    </ResetPasswordContext.Provider>
  );
}

export function ResetPasswordContent({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: boolean;
  children: ReactNode;
}) {
  const { isSuccess } = useResetPasswordContext();
  if (isSuccess && hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
}

export function ResetPasswordErrorMessage() {
  const { error } = useResetPasswordContext();
  if (!error?.message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Text className="text-destructive-foreground">{error.message}</Text>
    </Alert>
  );
}

export function ResetPasswordForm({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

export function ResetPasswordFormFields() {
  const { mutate, isPending } = useResetPasswordContext();

  const form = useForm({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data);
  });

  return (
    <View className="gap-4">
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="gap-2">
            <Text className="text-sm font-medium">New Password</Text>
            <Input
              placeholder="********"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              editable={!isPending}
              error={!!fieldState.error}
            />
            {fieldState.error && (
              <Text className="text-destructive text-sm">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Button onPress={onSubmit} isLoading={isPending} className="mt-4 w-full">
        Reset password
      </Button>
    </View>
  );
}

export function ResetPasswordFooter({
  children,
  link,
}: {
  children: ReactNode;
  link?: ReactNode;
}) {
  return (
    <View className="mt-6 flex-row justify-center">
      <Text className="text-muted-foreground">{children}</Text>
      {link}
    </View>
  );
}

export function ResetPasswordSuccess({ children }: { children: ReactNode }) {
  const { isSuccess } = useResetPasswordContext();

  if (!isSuccess) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
}
