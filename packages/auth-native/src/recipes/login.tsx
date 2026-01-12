import type { ReactNode } from "react";
import type { TextInput } from "react-native";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import {
  appleAuth,
  AppleButton as BaseAppleButton,
} from "@invertase/react-native-apple-authentication";
import { styled } from "nativewind";
import { z } from "zod";

import type { loginRequestSchema } from "@tonik/auth/schemas";
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

  const value = useMemo(() => {
    return {
      mutate: mutateCallback,
      error,
      variables,
      isPending,
      isSuccess,
      localError,
      setLocalError,
    };
  }, [
    error,
    variables,
    isPending,
    mutateCallback,
    localError,
    setLocalError,
    isSuccess,
  ]);

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
      size="lg"
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

const LoginSectionSplitter = ({ text }: { text?: string }) => {
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">{text ?? "or"}</Text>
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

const LoginOtpEmailFields = ({
  labelText,
  placeholder,
}: {
  labelText?: string;
  placeholder?: string;
}) => {
  const form = useFormContext<LoginOtpEmailData>();

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{labelText ?? "Email"}</FormLabel>
          <Input
            placeholder={placeholder ?? "email@example.com"}
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

const DEFAULT_OTP_LENGTH = 6;

const LoginOtpVerifyContext = createContext<{ length: number } | null>(null);

const useLoginOtpVerifyContext = () => {
  const context = useContext(LoginOtpVerifyContext);
  if (!context) {
    throw new Error(
      "useLoginOtpVerifyContext must be used within a LoginOtpVerify",
    );
  }
  return context;
};

const LoginOtpVerify = ({
  children,
  email,
  length = DEFAULT_OTP_LENGTH,
}: {
  children?: ReactNode;
  email: string;
  length?: number;
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
      code: z
        .string()
        .min(length, { message: `Code must be ${length} digits` })
        .max(length),
    }),
    defaultValues: {
      type: "otp-verify",
      email,
      code: "",
    },
    errors,
  });

  const submitRef = useRef<LoginFormSubmitter>({
    submit: () =>
      void form.handleSubmit((data) => {
        loginContext.mutate(data);
      })(),
  });

  const otpVerifyContextValue = useMemo(() => ({ length }), [length]);

  return (
    <LoginOtpVerifyContext.Provider value={otpVerifyContextValue}>
      <LoginFormSubmitterContext.Provider value={submitRef}>
        <Form {...form}>
          <View className="gap-4">{children}</View>
        </Form>
      </LoginFormSubmitterContext.Provider>
    </LoginOtpVerifyContext.Provider>
  );
};

const LoginOtpVerifyFields = () => {
  const { length } = useLoginOtpVerifyContext();
  const form = useFormContext<LoginOtpVerifyData>();
  const inputRefs = useRef(Array(length).fill(null) as (TextInput | null)[]);
  const loginContext = useLoginContext();

  const handleTextChange = (
    text: string,
    index: number,
    field: { value?: string; onChange: (value: string) => void },
  ) => {
    const currentValue = field.value ?? "";
    const newValue = currentValue.split("");

    // Extract only digits from the input
    const digits = text.replace(/[^0-9]/g, "");

    // Detect paste: more than 1 digit entered at once
    if (digits.length > 1) {
      // Check if pasted content contains exact length code
      const exactMatch = new RegExp(`^\\d{${length}}$`).exec(digits);
      if (exactMatch) {
        // Full code pasted - fill all and auto-submit
        form.setValue("code", exactMatch[0]);
        inputRefs.current[length - 1]?.focus();
        // Auto-submit when full code is pasted
        loginContext.mutate({
          type: "otp-verify",
          email: form.getValues("email"),
          code: exactMatch[0],
        });
        return;
      }

      // Partial paste: fill from current index to the right
      const availableSlots = length - index;
      const digitsToFill = digits.slice(0, availableSlots);

      for (let i = 0; i < digitsToFill.length; i++) {
        newValue[index + i] = digitsToFill[i] ?? "";
      }
      field.onChange(newValue.join(""));

      // Focus the next empty input or last filled input
      const lastFilledIndex = Math.min(
        index + digitsToFill.length - 1,
        length - 1,
      );
      const nextEmptyIndex = lastFilledIndex + 1;
      if (nextEmptyIndex < length) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[length - 1]?.blur();
        // Check if all fields are filled after paste
        const finalCode = newValue.join("");
        if (finalCode.length === length) {
          loginContext.mutate({
            type: "otp-verify",
            email: form.getValues("email"),
            code: finalCode,
          });
        }
      }
      return;
    }

    // Single digit input (normal typing)
    const singleDigit = digits.slice(0, 1);
    newValue[index] = singleDigit;
    field.onChange(newValue.join(""));

    // Auto-focus next input if digit entered
    if (singleDigit) {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        inputRefs.current[length - 1]?.blur();
        // Auto-submit when last digit is entered
        const finalCode = newValue.join("");
        if (finalCode.length === length) {
          loginContext.mutate({
            type: "otp-verify",
            email: form.getValues("email"),
            code: finalCode,
          });
        }
      }
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number,
    field: { value?: string },
  ) => {
    // Handle backspace - focus previous input when current is empty
    if (
      e.nativeEvent.key === "Backspace" &&
      !field.value?.[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="gap-4">
      <Text className="text-muted-foreground text-center">
        Enter the {length}-digit code we sent to your email
      </Text>

      <FormField
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <FormItem>
            <View className="items-center justify-center">
              <View className="flex-row gap-2">
                {Array.from({ length }, (_, index) => {
                  return (
                    <Input
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      className={cn(
                        "h-12 w-12 text-lg font-semibold",
                        fieldState.error ? "border-destructive/75" : undefined,
                      )}
                      value={field.value[index] ?? ""}
                      onChangeText={(text) =>
                        handleTextChange(text, index, field)
                      }
                      onKeyPress={(e) => handleKeyPress(e, index, field)}
                      editable={!form.formState.isSubmitting}
                      error={!!fieldState.error}
                      keyboardType="number-pad"
                      textAlign="center"
                      secureTextEntry={false}
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
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
