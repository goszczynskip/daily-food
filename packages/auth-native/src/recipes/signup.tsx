import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Platform, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { emailPasswordSchema } from "@tonik/auth/schemas";
import { Alert, Button, Input, Separator, Text } from "@tonik/ui-native";

import type { SignupContextValue } from "../types";

const SignupContext = createContext<SignupContextValue | null>(null);

const useSignupContext = () => {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error("Signup components must be used within <Signup>");
  return ctx;
};

export function Signup({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
  variables,
}: SignupContextValue & { children: ReactNode }) {
  return (
    <SignupContext.Provider
      value={{ mutate, isPending, error, isSuccess, variables }}
    >
      <View className="bg-background flex-1 p-6">{children}</View>
    </SignupContext.Provider>
  );
}

export function SignupContent({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useSignupContext();
  if (isSuccess && hideOnSuccess && variables?.type === hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
}

export function SignupSocial({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

export function SignupSocialGoogle({ onPress }: { onPress?: () => void }) {
  const { isPending } = useSignupContext();
  return (
    <Button
      variant="outline"
      className="w-full"
      onPress={onPress}
      disabled={isPending}
    >
      Continue with Google
    </Button>
  );
}

export function SignupSocialApple({
  onPress,
  showOnAndroid = false,
}: {
  onPress?: () => void;
  showOnAndroid?: boolean;
}) {
  const { isPending } = useSignupContext();

  if (Platform.OS !== "ios" && !showOnAndroid) {
    return null;
  }

  return (
    <Button
      variant="default"
      className="w-full bg-black"
      onPress={onPress}
      disabled={isPending}
    >
      Continue with Apple
    </Button>
  );
}

export function SignupSectionSplitter() {
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">or</Text>
      <Separator className="flex-1" />
    </View>
  );
}

export function SignupErrorMessage() {
  const { error } = useSignupContext();
  if (!error?.message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Text className="text-destructive-foreground">{error.message}</Text>
    </Alert>
  );
}

export function SignupForm({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

export function SignupFormFields() {
  const { mutate, isPending } = useSignupContext();

  const form = useForm({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate({ type: "email", ...data });
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
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="gap-2">
            <Text className="text-sm font-medium">Password</Text>
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
        Create account
      </Button>
    </View>
  );
}

export function SignupFooter({
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

export function SignupSuccess({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useSignupContext();

  if (!isSuccess || variables?.type !== type) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
}
