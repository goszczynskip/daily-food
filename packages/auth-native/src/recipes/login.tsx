import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import {
  appleAuth,
  AppleButton as BaseAppleButton,
} from "@invertase/react-native-apple-authentication";
import { styled } from "nativewind";
import { z } from "zod";

import type { loginRequestSchema, otpVerifySchema } from "@tonik/auth/schemas";
import {
  Button,
  cn,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Text,
  useForm,
  useFormContext,
} from "@tonik/ui-native";

import type { LoginContextValue } from "../types";
import { useEventCallback } from "../hooks/use-event-callback";

const AppleButton = styled(BaseAppleButton, {
  className: "style",
});

const loginContext = createContext<LoginContextValue | null>(null);
const Provider = loginContext.Provider;

const useLoginContext = () => {
  const context = useContext(loginContext);
  if (!context) {
    throw new Error("useLoginContext must be used within a Login");
  }
  return context;
};

interface LoginFormSubmitter {
  submit: () => void;
}

const LoginFormSubmitterContext =
  createContext<React.RefObject<LoginFormSubmitter> | null>(null);

const useLoginFormSubmitter = () => {
  const context = useContext(LoginFormSubmitterContext);
  if (!context) {
    throw new Error(
      "useLoginFormSubmitter must be used within a form component",
    );
  }
  return context;
};

const Login = ({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
  variables,
}: Omit<LoginContextValue, "localError" | "setLocalError"> & {
  children: ReactNode;
}) => {
  const [localError, setLocalError] = useState<{ message?: string } | null>(
    null,
  );
  const mutateCallback = useEventCallback(mutate);

  const value = useMemo(
    () => ({
      mutate: mutateCallback,
      error,
      variables,
      isPending,
      isSuccess,
      localError,
      setLocalError,
    }),
    [error, variables, isPending, mutateCallback, localError, setLocalError],
  );

  return <Provider value={value}>{children}</Provider>;
};

const LoginContent = ({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: string;
  children: ReactNode;
}) => {
  const { isSuccess, variables } = useLoginContext();
  if (isSuccess && hideOnSuccess && variables?.type === hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
};

const LoginSocial = ({ children }: { children: ReactNode }) => {
  return <View className="gap-3">{children}</View>;
};

const LoginSocialGoogle = ({ onPress }: { onPress?: () => void }) => {
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
};

const LoginSocialApple = ({
  showOnAndroid = false,
  className,
}: {
  showOnAndroid?: boolean;
  className?: string;
}) => {
  const { mutate, setLocalError } = useLoginContext();

  if (Platform.OS !== "ios" && !showOnAndroid) {
    return null;
  }

  return (
    <AppleButton
      className={cn("m-0 h-12", className)}
      buttonType={BaseAppleButton.Type.SIGN_IN}
      buttonStyle={BaseAppleButton.Style.BLACK}
      onPress={async () => {
        const authResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        const credentialState = await appleAuth.getCredentialStateForUser(
          authResponse.user,
        );

        if (credentialState === appleAuth.State.REVOKED) {
          setLocalError({ message: "User credentials are revoked" });
        }

        if (credentialState === appleAuth.State.NOT_FOUND) {
          setLocalError({ message: "Not found a user token" });
        }

        if (credentialState === appleAuth.State.AUTHORIZED) {
          if (authResponse.identityToken === null) {
            setLocalError({ message: "Failed to obtain identityToken" });
          } else {
            mutate({
              type: "social-id-token",
              provider: "apple",
              token: authResponse.identityToken,
            });
          }
        }

        setLocalError({ message: "Unsupported auth state" });
      }}
    />
  );
};

const LoginSectionSplitter = () => {
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">or</Text>
      <Separator className="flex-1" />
    </View>
  );
};

const LoginErrorMessage = () => {
  const { error } = useLoginContext();
  if (!error?.message) return null;

  return (
    <View className="bg-destructive/30 border-destructive mb-4 rounded-md border px-4 py-2">
      <Text className="text-destructive-foreground text-start text-sm">
        {error.message}
        <Text className="text-muted-foreground block text-xs">
          Please try again
        </Text>
      </Text>
    </View>
  );
};

const loginUsernamePasswordSchema = z.object({
  type: z.literal("email"),
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  captchaToken: z.string().optional(),
});

type LoginUsernamePasswordData = z.infer<typeof loginUsernamePasswordSchema>;

const LoginUsernamePassword = ({ children }: { children?: ReactNode }) => {
  const loginContext = useLoginContext();

  const error =
    loginContext.variables?.type === "email" ? loginContext.error : "";

  const errors = useMemo(() => {
    return {
      type: undefined,
      email: error ? { type: "value", message: "" } : undefined,
      password: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: loginUsernamePasswordSchema,
    defaultValues: {
      type: "email",
      email: "",
      password: "",
      captchaToken: undefined,
    },
    errors: errors,
  });

  const submitRef = useRef<LoginFormSubmitter>({
    submit: () => form.handleSubmit(loginContext.mutate),
  });

  return (
    <LoginFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </LoginFormSubmitterContext.Provider>
  );
};

const LoginUsernamePasswordFields = ({
  forgotPasswordLink,
}: {
  forgotPasswordLink?: ReactNode;
}) => {
  const form = useFormContext<LoginUsernamePasswordData>();

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormItem>
            <View className="flex w-full items-center">
              <FormLabel className="block">Email</FormLabel>
              <View className="ml-auto block text-end text-sm whitespace-nowrap">
                {forgotPasswordLink}
              </View>
            </View>
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

      <FormField
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Type in your password..."
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
    </>
  );
};

const loginOtpEmailSchema = z.object({
  type: z.literal("otp-email"),
  email: z.email({ message: "Invalid email" }),
  captchaToken: z.string().optional(),
});

type LoginOtpEmailData = z.infer<typeof loginOtpEmailSchema>;

const LoginOtpEmail = ({ children }: { children?: ReactNode }) => {
  const loginContext = useLoginContext();

  const error =
    loginContext.variables?.type === "otp-email" ? loginContext.error : "";

  const errors = useMemo(() => {
    return {
      type: undefined,
      email: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: loginOtpEmailSchema,
    defaultValues: { type: "otp-email", email: "", captchaToken: undefined },
    errors,
  });

  const submitRef = useRef<LoginFormSubmitter>({
    submit: () =>
      void form.handleSubmit((data) => {
        loginContext.mutate(data);
      })(),
  });

  return (
    <LoginFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </LoginFormSubmitterContext.Provider>
  );
};

const LoginOtpEmailFields = () => {
  const form = useFormContext<LoginOtpEmailData>();

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
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

type LoginOtpVerifyData = z.infer<typeof loginRequestSchema> & {
  type: "otp-verify";
};

const LoginOtpVerify = ({
  children,
  email,
  messageId,
}: {
  children?: ReactNode;
  email: string;
  messageId: string;
}) => {
  const loginContext = useLoginContext();

  const error =
    loginContext.variables?.type === "otp-verify" ? loginContext.error : null;

  const errors = useMemo(() => {
    return {
      type: undefined,
      code: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: z.object({
      type: z.literal("otp-verify"),
      email: z.string().email({ message: "Invalid email" }),
      code: z.string().min(6, { message: "Code must be 6 digits" }).max(6),
      messageId: z.string(),
    }),
    defaultValues: {
      type: "otp-verify",
      email,
      code: "",
      messageId,
    },
    errors,
  });

  const submitRef = useRef<LoginFormSubmitter>({
    submit: () =>
      void form.handleSubmit((data) => {
        loginContext.mutate(data);
      })(),
  });

  return (
    <LoginFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </LoginFormSubmitterContext.Provider>
  );
};

const LoginOtpVerifyFields = () => {
  const form = useFormContext<LoginOtpVerifyData>();

  return (
    <View className="gap-4">
      <Text className="text-muted-foreground text-center">
        Enter the 6-digit code we sent to your email
      </Text>

      <FormField
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <FormItem>
            <View className="items-center justify-center">
              <View className="flex-row gap-2">
                {Array.from({ length: 6 }, (_, index) => {
                  const chars = field.value.split("")
                  return (
                    <Input
                      key={index}
                      className={cn(
                        "h-12 w-12 text-lg font-semibold",
                        fieldState.error ? "border-destructive/75" : undefined,
                      )}
                      value={chars[index] ?? ""}
                      onChangeText={(text) => {
                        const currentValue = field.value || "";
                        const newValue = currentValue.split("");
                        // Only allow numbers and single character per input
                        const numericText = text
                          .replace(/[^0-9]/g, "")
                          .slice(0, 1);
                        newValue[index] = numericText;
                        field.onChange(newValue.join(""));
                      }}
                      editable={!form.formState.isSubmitting}
                      error={!!fieldState.error}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      secureTextEntry={false}
                    />
                  );
                })}
              </View>
            </View>
            <FormMessage />
          </FormItem>
        )}
      />
    </View>
  );
};

interface LoginButtonProps {
  type?: z.infer<typeof loginRequestSchema>["type"];
  children?: ReactNode;
  className?: string;
}

const LoginButton = ({
  type: extType,
  children,
  className,
}: LoginButtonProps) => {
  const loginContext = useLoginContext();
  const formContext = useFormContext<z.infer<typeof loginRequestSchema>>();
  const submitter = useLoginFormSubmitter();

  const type = extType ?? formContext.getValues("type");

  const isPending =
    loginContext.variables?.type === type && loginContext.isPending;

  return (
    <Button
      size="lg"
      textClassName="text-lg"
      className={cn("", className)}
      isLoading={isPending}
      onPress={submitter.current.submit}
    >
      {children ?? "Sign in"}
    </Button>
  );
};

const LoginFooter = ({
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

const LoginSuccess = ({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) => {
  const { isSuccess, variables } = useLoginContext();

  if (!isSuccess || variables?.type !== type) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
};

export {
  Login,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
  LoginOtpEmail,
  LoginOtpEmailFields,
  LoginOtpVerify,
  LoginOtpVerifyFields,
  LoginFooter,
  LoginButton,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialGoogle,
  LoginSocialApple,
  LoginErrorMessage,
  LoginSuccess,
  LoginContent,
};
