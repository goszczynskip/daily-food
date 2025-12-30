import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { initPasswordResetRequestSchema } from "@tonik/auth/schemas";
import { Alert, Button, Input, Text } from "@tonik/ui-native";

import type { ForgotPasswordContextValue } from "../types";

const ForgotPasswordContext = createContext<ForgotPasswordContextValue | null>(
  null,
);

const useForgotPasswordContext = () => {
  const ctx = useContext(ForgotPasswordContext);
  if (!ctx)
    throw new Error(
      "ForgotPassword components must be used within <ForgotPassword>",
    );
  return ctx;
};

export function ForgotPassword({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
}: ForgotPasswordContextValue & { children: ReactNode }) {
  return (
    <ForgotPasswordContext.Provider
      value={{ mutate, isPending, error, isSuccess }}
    >
      <View className="bg-background flex-1 p-6">{children}</View>
    </ForgotPasswordContext.Provider>
  );
}

export function ForgotPasswordContent({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: boolean;
  children: ReactNode;
}) {
  const { isSuccess } = useForgotPasswordContext();
  if (isSuccess && hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
}

export function ForgotPasswordErrorMessage() {
  const { error } = useForgotPasswordContext();
  if (!error?.message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Text className="text-destructive-foreground">{error.message}</Text>
    </Alert>
  );
}

export function ForgotPasswordForm({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

export function ForgotPasswordFormFields() {
  const { mutate, isPending } = useForgotPasswordContext();

  const form = useForm({
    resolver: zodResolver(initPasswordResetRequestSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data);
  });

  return (
    <View className="gap-4">
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <View className="gap-2">
            <Text className="text-sm font-medium">Email</Text>
            <Input
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
      <Button onPress={onSubmit} isLoading={isPending} className="w-full">
        Send reset link
      </Button>
    </View>
  );
}

export function ForgotPasswordFooter({
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

export function ForgotPasswordSuccess({ children }: { children: ReactNode }) {
  const { isSuccess } = useForgotPasswordContext();

  if (!isSuccess) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
}
