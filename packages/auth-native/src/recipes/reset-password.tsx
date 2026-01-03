import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { View } from "react-native";
import type { z } from "zod";

import { resetPasswordRequestSchema } from "@tonik/auth/schemas";
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

import type { ResetPasswordContextValue } from "../types";
import { useEventCallback } from "../hooks/use-event-callback";

const ResetPasswordContext = createContext<ResetPasswordContextValue | null>(
  null,
);

const useResetPasswordContext = () => {
  const context = useContext(ResetPasswordContext);
  if (!context) {
    throw new Error(
      "useResetPasswordContext must be used within a ResetPassword",
    );
  }
  return context;
};

interface ResetPasswordFormSubmitter {
  submit: () => void;
}

const ResetPasswordFormSubmitterContext =
  createContext<React.MutableRefObject<ResetPasswordFormSubmitter> | null>(
    null,
  );

const useResetPasswordFormSubmitter = () => {
  const context = useContext(ResetPasswordFormSubmitterContext);
  if (!context) {
    throw new Error("useResetPasswordFormSubmitter must be used within a form");
  }
  return context;
};

const ResetPassword = ({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
}: ResetPasswordContextValue & { children: ReactNode }) => {
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
    <ResetPasswordContext.Provider value={value}>
      <View className="bg-background flex-1 p-6">{children}</View>
    </ResetPasswordContext.Provider>
  );
};

const ResetPasswordContent = ({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: boolean;
  children: ReactNode;
}) => {
  const { isSuccess } = useResetPasswordContext();
  if (isSuccess && hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
};

const ResetPasswordErrorMessage = () => {
  const { error } = useResetPasswordContext();
  if (!error?.message) return null;

  return (
    <View className="bg-destructive/30 border-destructive mb-4 rounded-md border px-4 py-2">
      <Text className="text-destructive-foreground text-start text-sm">
        {error.message}
      </Text>
    </View>
  );
};

type ResetPasswordFormData = z.infer<typeof resetPasswordRequestSchema>;

const ResetPasswordForm = ({ children }: { children?: ReactNode }) => {
  const { mutate, error } = useResetPasswordContext();

  const errors = useMemo(() => {
    return {
      password: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: resetPasswordRequestSchema,
    defaultValues: { password: "" },
    errors,
  });

  const submitRef = useRef<ResetPasswordFormSubmitter>({
    submit: () => form.handleSubmit(mutate),
  });

  return (
    <ResetPasswordFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </ResetPasswordFormSubmitterContext.Provider>
  );
};

const ResetPasswordFormFields = () => {
  const form = useFormContext<ResetPasswordFormData>();

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="block">New Password</FormLabel>
          <Input
            placeholder="Type in your new password..."
            className={fieldState.error ? "border-destructive/75" : undefined}
            value={field.value}
            onChangeText={field.onChange}
            editable={!form.formState.isSubmitting}
            error={!!fieldState.error}
            secureTextEntry
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface ResetPasswordButtonProps {
  children?: ReactNode;
  className?: string;
}

const ResetPasswordButton = ({
  children,
  className,
}: ResetPasswordButtonProps) => {
  const { isPending } = useResetPasswordContext();
  const submitter = useResetPasswordFormSubmitter();

  return (
    <Button
      className={className}
      isLoading={isPending}
      onPress={submitter.current.submit}
    >
      {children ?? "Reset password"}
    </Button>
  );
};

const ResetPasswordFooter = ({
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

const ResetPasswordSuccess = ({ children }: { children: ReactNode }) => {
  const { isSuccess } = useResetPasswordContext();

  if (!isSuccess) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
};

export {
  ResetPassword,
  ResetPasswordForm,
  ResetPasswordFormFields,
  ResetPasswordFooter,
  ResetPasswordButton,
  ResetPasswordErrorMessage,
  ResetPasswordSuccess,
  ResetPasswordContent,
};
