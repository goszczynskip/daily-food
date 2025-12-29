import type { ReactNode } from "react";
import type { z } from "zod";
import { createContext, useContext, useMemo } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

import { cn } from "@tonik/ui";
import { Alert, AlertDescription, AlertTitle } from "@tonik/ui/alert";
import { Button } from "@tonik/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@tonik/ui/form";
import { Input } from "@tonik/ui/input";
import { Spinner } from "@tonik/ui/spinner";

import { useEventCallback } from "../hooks/use-event-callback";
import { initPasswordResetRequestSchema } from "../schemas";

interface ForgotPasswordContext {
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  error?: { message?: string } | null;
  isPending?: boolean;
  isSuccess?: boolean;
}

const forgotPasswordContext = createContext<ForgotPasswordContext | null>(null);
const Provider = forgotPasswordContext.Provider;

type SubmitData = z.infer<typeof initPasswordResetRequestSchema>;

const useForgotPasswordContext = () => {
  const context = useContext(forgotPasswordContext);
  if (!context) {
    throw new Error(
      "useForgotPasswordContext must be used within a ForgotPassword component",
    );
  }
  return context;
};

interface ForgotPasswordProps {
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  isPending?: boolean;
  isSuccess?: boolean;
  error?: { message?: string } | null;
  children?: ReactNode;
}

const ForgotPassword = ({
  children,
  mutate,
  error,
  variables,
  isPending,
  isSuccess,
}: ForgotPasswordProps) => {
  const mutateCallback = useEventCallback(mutate);

  const value = useMemo(
    () => ({
      mutate: mutateCallback,
      error,
      variables,
      isPending,
      isSuccess,
    }),
    [error, variables, isPending, mutateCallback],
  );

  return <Provider value={value}>{children}</Provider>;
};

export const useForgotPasswordForm = ({
  error,
}: {
  error?: { message?: string } | null;
}) => {
  const errors = useMemo(() => {
    return {
      type: undefined,
      email: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  return useForm({
    schema: initPasswordResetRequestSchema,
    defaultValues: { email: "" },
    errors: errors,
  });
};

const ForgotPasswordForm = ({
  form: extForm,
}: {
  form?: ReturnType<typeof useForgotPasswordForm>;
}) => {
  const { error, isPending, mutate } = useForgotPasswordContext();
  const form = useForgotPasswordForm({ error });

  return (
    <Form {...form} {...extForm}>
      <form
        onSubmit={form.handleSubmit(mutate)}
        className="flex flex-col gap-4 text-start"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="m@example.com"
                  className={cn({
                    ["border-destructive/75"]: fieldState.error,
                  })}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-1" type="submit">
          {isPending ? (
            <Spinner className="text-background" />
          ) : (
            "Send reset email"
          )}
        </Button>
      </form>
    </Form>
  );
};

const ForgotPasswordSuccessMessage = () => {
  const { isSuccess, variables } = useForgotPasswordContext();

  const email = variables?.email;
  if (!isSuccess || !email) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-2 text-left">
      <CheckCircle className="size-4" />
      <AlertTitle>Check your email</AlertTitle>
      <AlertDescription>
        We've sent a password reset link to{" "}
        <span className="font-medium">{email}</span>
      </AlertDescription>
    </Alert>
  );
};

const ForgotPasswordErrorMessage = () => {
  const { error } = useForgotPasswordContext();

  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-2 text-left">
      <AlertCircle className="size-4" />
      <AlertTitle>Unable to reset password</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
};

const ForgotPasswordFooter = ({
  children,
  link,
}: {
  children?: ReactNode;
  link: ReactNode;
}) => {
  return (
    <div className="text-muted-foreground pt-4 text-sm">
      {children}
      <Button variant="link" className="px-0" asChild>
        {link}
      </Button>
    </div>
  );
};

export {
  ForgotPassword,
  ForgotPasswordForm,
  ForgotPasswordSuccessMessage,
  ForgotPasswordErrorMessage,
  ForgotPasswordFooter,
};
