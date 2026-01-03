import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { z } from "zod";

import {
  Button,
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

import type { SignupContextValue } from "../types";
import { useEventCallback } from "../hooks/use-event-callback";

const signupContext = createContext<SignupContextValue | null>(null);
const Provider = signupContext.Provider;

const useSignupContext = () => {
  const context = useContext(signupContext);
  if (!context) {
    throw new Error("useSignupContext must be used within a Signup");
  }
  return context;
};

interface SignupFormSubmitter {
  submit: () => void;
}

const SignupFormSubmitterContext =
  createContext<React.MutableRefObject<SignupFormSubmitter> | null>(null);

const useSignupFormSubmitter = () => {
  const context = useContext(SignupFormSubmitterContext);
  if (!context) {
    throw new Error(
      "useSignupFormSubmitter must be used within a form component",
    );
  }
  return context;
};

const Signup = ({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
  variables,
}: SignupContextValue & { children: ReactNode }) => {
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

const SignupContent = ({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: string;
  children: ReactNode;
}) => {
  const { isSuccess, variables } = useSignupContext();
  if (isSuccess && hideOnSuccess && variables?.type === hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
};

const SignupSocial = ({ children }: { children: ReactNode }) => {
  return <View className="gap-3">{children}</View>;
};

const SignupSocialGoogle = ({ onPress }: { onPress?: () => void }) => {
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
};

const SignupSocialApple = ({
  onPress,
  showOnAndroid = false,
}: {
  onPress?: () => void;
  showOnAndroid?: boolean;
}) => {
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
};

const SignupSectionSplitter = () => {
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">or</Text>
      <Separator className="flex-1" />
    </View>
  );
};

const SignupErrorMessage = () => {
  const { error } = useSignupContext();
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

const signupFormSchema = z.object({
  type: z.literal("email"),
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  captchaToken: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

const SignupForm = ({ children }: { children?: ReactNode }) => {
  const signupContext = useSignupContext();

  const error =
    signupContext.variables?.type === "email" ? signupContext.error : "";

  const errors = useMemo(() => {
    return {
      type: undefined,
      email: error ? { type: "value", message: "" } : undefined,
      password: error ? { type: "value", message: error.message } : undefined,
    };
  }, [error]);

  const form = useForm({
    schema: signupFormSchema,
    defaultValues: {
      type: "email",
      email: "",
      password: "",
      captchaToken: undefined,
    },
    errors: errors,
  });

  const submitRef = useRef<SignupFormSubmitter>({
    submit: () => form.handleSubmit(signupContext.mutate),
  });

  return (
    <SignupFormSubmitterContext.Provider value={submitRef}>
      <Form {...form}>
        <View className="gap-4">{children}</View>
      </Form>
    </SignupFormSubmitterContext.Provider>
  );
};

const SignupFormFields = () => {
  const form = useFormContext<SignupFormData>();

  return (
    <>
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

interface SignupButtonProps {
  children?: ReactNode;
  className?: string;
}

const SignupButton = ({ children, className }: SignupButtonProps) => {
  const signupContext = useSignupContext();
  const submitter = useSignupFormSubmitter();

  const isPending = signupContext.isPending;

  return (
    <Button
      className={className}
      isLoading={isPending}
      onPress={submitter.current.submit}
    >
      {children ?? "Create account"}
    </Button>
  );
};

const SignupFooter = ({
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

const SignupSuccess = ({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) => {
  const { isSuccess, variables } = useSignupContext();

  if (!isSuccess || variables?.type !== type) {
    return null;
  }

  return <View className="flex-1 items-center justify-center">{children}</View>;
};

export {
  Signup,
  SignupForm,
  SignupFormFields,
  SignupFooter,
  SignupButton,
  SignupSectionSplitter,
  SignupSocial,
  SignupSocialGoogle,
  SignupSocialApple,
  SignupErrorMessage,
  SignupSuccess,
  SignupContent,
};
