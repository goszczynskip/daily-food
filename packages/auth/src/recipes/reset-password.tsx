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
import { resetPasswordRequestSchema } from "../schemas";

interface ResetPasswordContext {
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  error?: { message?: string } | null;
  isPending?: boolean;
  isSuccess?: boolean;
}

const resetPasswordContext = createContext<ResetPasswordContext | null>(null);
const Provider = resetPasswordContext.Provider;

type SubmitData = z.infer<typeof resetPasswordRequestSchema>;

const useResetPasswordContext = () => {
  const context = useContext(resetPasswordContext);
  if (!context) {
    throw new Error("useResetPasswordContext must be used within a Login");
  }
  return context;
};

interface ResetPasswordProps {
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  isPending?: boolean;
  isSuccess?: boolean;
  error?: { message?: string } | null;
  children?: ReactNode;
}

const ResetPassword = ({
  children,
  mutate,
  error,
  variables,
  isPending,
  isSuccess,
}: ResetPasswordProps) => {
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

export const useResetPasswordForm = ({
  error,
}: {
  error?: { message?: string } | null;
}) => {
  const errors = useMemo(() => {
    return {
      type: undefined,
      password: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  return useForm({
    schema: resetPasswordRequestSchema,
    defaultValues: { password: "" },
    errors: errors,
  });
};

const ResetPasswordForm = ({
  form: extForm,
}: {
  form?: ReturnType<typeof useResetPasswordForm>;
}) => {
  const { error, isPending, mutate } = useResetPasswordContext();
  const form = useResetPasswordForm({ error });

  return (
    <Form {...form} {...extForm}>
      <form
        onSubmit={form.handleSubmit(mutate)}
        className="flex flex-col gap-4 text-start"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Type in your password..."
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
            "Change password"
          )}
        </Button>
      </form>
    </Form>
  );
};

const ResetPasswordSuccessMessage = () => {
  const { isSuccess } = useResetPasswordContext();

  if (!isSuccess) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-2 text-left">
      <CheckCircle className="size-4" />
      <AlertTitle>Passoword changed</AlertTitle>
      <AlertDescription>
        Now you can login with your new password.
      </AlertDescription>
    </Alert>
  );
};

const ResetPasswordErrorMessage = () => {
  const { error } = useResetPasswordContext();

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

const ResetPasswordFooter = ({
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
  ResetPassword,
  ResetPasswordForm,
  ResetPasswordSuccessMessage,
  ResetPasswordErrorMessage,
  ResetPasswordFooter,
};
