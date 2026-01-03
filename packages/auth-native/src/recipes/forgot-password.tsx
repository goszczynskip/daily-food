import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { View } from "react-native";
import type { z } from "zod";

import { initPasswordResetRequestSchema } from "@tonik/auth/schemas";
import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Text,
  useForm,
  useFormContext,
} from "@tonik/ui-native";

import type { ForgotPasswordContextValue } from "../types";
import { useEventCallback } from "../hooks/use-event-callback";

const ForgotPasswordContext = createContext<ForgotPasswordContextValue | null>(
  null,
);

const useForgotPasswordContext = () => {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error(
      "useForgotPasswordContext must be used within a ForgotPassword",
    );
  }
  return context;
};

interface ForgotPasswordFormSubmitter {
  submit: () => void;
}

const ForgotPasswordFormSubmitterContext =
  createContext<React.MutableRefObject<ForgotPasswordFormSubmitter> | null>(
    null,
  );

const useForgotPasswordFormSubmitter = () => {
  const context = useContext(ForgotPasswordFormSubmitterContext);
  if (!context) {
    throw new Error(
      "useForgotPasswordFormSubmitter must be used within a form",
    );
  }
  return context;
};

const ForgotPassword = ({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
}: ForgotPasswordContextValue & { children: ReactNode }) => {
  const mutateCallback = useEventCallback(mutate);

  const value = useMemo(
    () => ({
      mutate: mutateCallback,
      error,
      isPending,
      isSuccess,
    }),
    [error, isPending, mutateCallback],
  );

  return (
    <ForgotPasswordContext.Provider value={value}>
      <View className="bg-background flex-1 p-6">{children}</View>
    </ForgotPasswordContext.Provider>
  );
};

const ForgotPasswordContent = ({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: boolean;
  children: ReactNode;
}) => {
  const { isSuccess } = useForgotPasswordContext();
  if (isSuccess && hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
};

const ForgotPasswordErrorMessage = () => {
  const { error } = useForgotPasswordContext();
  if (!error?.message) return null;

  return (
    <View className="bg-destructive/30 border-destructive mb-4 rounded-md border px-4 py-2">
      <Text className="text-destructive-foreground text-start text-sm">
        {error.message}
      </Text>
    </View>
  );
};

type ForgotPasswordFormData = z.infer<typeof initPasswordResetRequestSchema>;

const ForgotPasswordForm = ({ children }: { children?: ReactNode }) => {
  const { mutate, error } = useForgotPasswordContext();

  const errors = useMemo(() => {
    return {
      email: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: initPasswordResetRequestSchema,
    defaultValues: { email: "" },
    errors,
  });

  const submitRef = useRef<ForgotPasswordFormSubmitter>({
    submit: () => form.handleSubmit(mutate),
  });

  return (
    <ForgotPasswordFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </ForgotPasswordFormSubmitterContext.Provider>
  );
};

const ForgotPasswordFormFields = () => {
  const form = useFormContext<ForgotPasswordFormData>();

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="block">Email</FormLabel>
          <Input
            placeholder="m@example.com"
            className={fieldState.error ? "border-destructive/75" : undefined}
            value={field.value}
            onChangeText={field.onChange}
            editable={!form.formState.isSubmitting}
            error={!!fieldState.error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface ForgotPasswordButtonProps {
  children?: ReactNode;
  className?: string;
}

const ForgotPasswordButton = ({
  children,
  className,
}: ForgotPasswordButtonProps) => {
  const { isPending } = useForgotPasswordContext();
  const submitter = useForgotPasswordFormSubmitter();

  return (
    <Button
      className={className}
      isLoading={isPending}
      onPress={submitter.current.submit}
    >
      {children ?? "Send reset link"}
    </Button>
  );
};

const ForgotPasswordFooter = ({
  children,
  link,
}: {
  children: ReactNode;
  link?: ReactNode;
}) => {
  return (
    <View className="mt-6 flex-row justify-center">
      <Text className="text-muted-foreground">{children}</Text>
      {link}
    </View>
  );
};

const ForgotPasswordSuccess = ({ children }: { children: ReactNode }) => {
  const { isSuccess } = useForgotPasswordContext();

  if (!isSuccess) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
};

export {
  ForgotPassword,
  ForgotPasswordForm,
  ForgotPasswordFormFields,
  ForgotPasswordFooter,
  ForgotPasswordButton,
  ForgotPasswordErrorMessage,
  ForgotPasswordSuccess,
  ForgotPasswordContent,
};
