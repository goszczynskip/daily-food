import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Platform, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { emailPasswordSchema, otpEmailSchema } from "@tonik/auth/schemas";
import { Alert, Button, Input, Separator, Text } from "@tonik/ui-native";

import type { LoginContextValue } from "../types";

const LoginContext = createContext<LoginContextValue | null>(null);

const useLoginContext = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error("Login components must be used within <Login>");
  return ctx;
};

export function Login({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
  variables,
}: LoginContextValue & { children: ReactNode }) {
  return (
    <LoginContext.Provider
      value={{ mutate, isPending, error, isSuccess, variables }}
    >
      <View className="bg-background flex-1 p-6">{children}</View>
    </LoginContext.Provider>
  );
}

export function LoginContent({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useLoginContext();
  if (isSuccess && hideOnSuccess && variables?.type === hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
}

export function LoginSocial({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

export function LoginSocialGoogle({ onPress }: { onPress?: () => void }) {
  const { isPending } = useLoginContext();
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

export function LoginSocialApple({
  onPress,
  showOnAndroid = false,
}: {
  onPress?: () => void;
  showOnAndroid?: boolean;
}) {
  const { isPending } = useLoginContext();

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

export function LoginSectionSplitter() {
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">or</Text>
      <Separator className="flex-1" />
    </View>
  );
}

export function LoginErrorMessage() {
  const { error } = useLoginContext();
  if (!error?.message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Text className="text-destructive-foreground">{error.message}</Text>
    </Alert>
  );
}

export function LoginUsernamePassword({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

export function LoginUsernamePasswordFields({
  forgotPasswordLink,
}: {
  forgotPasswordLink?: ReactNode;
}) {
  const { mutate, isPending } = useLoginContext();

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
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium">Password</Text>
              {forgotPasswordLink}
            </View>
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
        Sign in
      </Button>
    </View>
  );
}

export function LoginOtpEmail({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

export function LoginOtpEmailFields() {
  const { mutate, isPending } = useLoginContext();

  const form = useForm({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate({ type: "otp-email", ...data });
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
        Send magic link
      </Button>
    </View>
  );
}

export function LoginFooter({
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

export function LoginSuccess({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useLoginContext();

  if (!isSuccess || variables?.type !== type) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
}
