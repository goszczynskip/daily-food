"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import {
  SiDiscord,
  SiFacebook,
  SiGithub,
  SiGoogle,
} from "@icons-pack/react-simple-icons";
import { Turnstile } from "@marsidev/react-turnstile";
import { z } from "zod";

import type { loginRequestSchema, providerList } from "@tonik/auth";
import { cn } from "@tonik/ui";
import { Button } from "@tonik/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormContext,
} from "@tonik/ui/form";
import { Input } from "@tonik/ui/input";
import { Separator } from "@tonik/ui/separator";
import { Slot } from "@tonik/ui/slot";
import { Spinner } from "@tonik/ui/spinner";
import { useTheme } from "@tonik/ui/theme";

import { useEventCallback } from "../hooks/use-event-callback";

export type SubmitData = z.infer<typeof loginRequestSchema>;

interface LoginContext {
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  error?: { message?: string } | null;
  isPending?: boolean;
  isSuccess?: boolean;
}

const loginContext = createContext<LoginContext | null>(null);
const Provider = loginContext.Provider;

const useLoginContext = () => {
  const context = useContext(loginContext);
  if (!context) {
    throw new Error("useLoginContext must be used within a Login");
  }
  return context;
};

const Login = ({
  children,
  mutate,
  error,
  isPending,
  isSuccess,
  variables: variables,
}: {
  children: ReactNode;
  mutate: (data: SubmitData) => void;
  variables?: SubmitData;
  isPending?: boolean;
  isSuccess?: boolean;
  error?: { message?: string } | null;
}) => {
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

const loginSchema = z.object({
  type: z.literal("email"),
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  captchaToken: z.string().optional(),
});

interface LoginUsernamePasswordProps {
  children?: ReactNode;
}

const LoginUsernamePassword = ({ children }: LoginUsernamePasswordProps) => {
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
    schema: loginSchema,
    defaultValues: {
      type: "email",
      email: "",
      password: "",
      captchaToken: undefined,
    },
    errors: errors,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(loginContext.mutate)}
        className="flex flex-col gap-4 text-start"
      >
        {children}
      </form>
    </Form>
  );
};

interface LoginUsernamePasswordFieldsProps {
  forgotPasswordLink?: ReactNode;
}

const LoginUsernamePasswordFields = ({
  forgotPasswordLink,
}: LoginUsernamePasswordFieldsProps) => {
  const form = useFormContext();
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormItem>
            <div className="flex w-full items-center">
              <FormLabel className="block">Email</FormLabel>

              <Slot className="ml-auto block text-end text-sm whitespace-nowrap underline">
                {forgotPasswordLink}
              </Slot>
            </div>
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
    </>
  );
};

interface LoginOtpEmailProps {
  children?: ReactNode;
}

const loginOtpEmailSchema = z.object({
  type: z.literal("otp-email"),
  email: z.email({ message: "Invalid email" }),
  captchaToken: z.string().optional(),
});

const LoginOtpEmail = ({ children }: LoginOtpEmailProps) => {
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(loginContext.mutate)}
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
        {children}
      </form>
    </Form>
  );
};

interface LoginButtonProps {
  type?: SubmitData["type"];
  children?: ReactNode;
}

const LoginButton = ({ type: extType, children }: LoginButtonProps) => {
  const loginContext = useLoginContext();
  const formContext = useFormContext<SubmitData>();
  const type = extType ?? formContext.getValues("type");

  const isPending =
    loginContext.variables?.type === type && loginContext.isPending;

  return (
    <Button className="mt-1" type="submit">
      {isPending ? <Spinner className="text-background" /> : children}
    </Button>
  );
};

interface LoginErrorMessageProps {
  type?: SubmitData["type"];
}

const LoginErrorMessage = ({ type }: LoginErrorMessageProps) => {
  const loginContext = useLoginContext();

  if (!loginContext.error || loginContext.variables?.type !== type) {
    return null;
  }

  return (
    <div className="border-destructive bg-destructive/30 animate-in fade-in zoom-in mb-4 rounded-md border border-solid px-4 py-2">
      <p className="text-destructive-foreground text-start text-sm">
        {loginContext.error.message}

        <span className="text-muted-foreground block text-xs">
          Please try again
        </span>
      </p>
    </div>
  );
};

const LoginSectionSplitter = () => {
  return (
    <div className="flex items-center gap-4 py-4">
      <Separator className="w-auto flex-1" />
      <p className="text-muted-foreground w-auto text-sm">or</p>
      <Separator className="w-auto flex-1" />
    </div>
  );
};

const LoginSocial = ({ children }: { children?: ReactNode }) => {
  return <div className="grid grid-flow-col gap-4">{children}</div>;
};

const LoginSocialButton = ({
  provider,
  name,
  children,
}: {
  provider: z.infer<typeof providerList>;
  name: string;
  children: ReactNode;
}) => {
  const loginContext = useLoginContext();
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => loginContext.mutate({ type: "social", provider })}
    >
      <Slot className="h-5">{children}</Slot>
      <span className="sr-only">Log in with {name}</span>
    </Button>
  );
};

const LoginSocialGoogle = () => {
  return (
    <LoginSocialButton name="Google" provider="google">
      <SiGoogle />
    </LoginSocialButton>
  );
};

const LoginSocialFacebook = () => {
  return (
    <LoginSocialButton name="Facebook" provider="facebook">
      <SiFacebook />
    </LoginSocialButton>
  );
};

const LoginSocialGithub = () => {
  return (
    <LoginSocialButton name="Github" provider="github">
      <SiGithub />
    </LoginSocialButton>
  );
};

const LoginSocialDiscord = () => {
  return (
    <LoginSocialButton name="Discord" provider="discord">
      <SiDiscord />
    </LoginSocialButton>
  );
};

const LoginFooter = ({
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

interface LoginCaptchaProps {
  siteKey: string;
}

const LoginCaptcha = ({ siteKey }: LoginCaptchaProps) => {
  const formContext = useFormContext<{ captchaToken?: string | undefined }>();

  const { theme } = useTheme();
  const cfTheme =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "auto";
  return (
    <FormField
      control={formContext.control}
      name="captchaToken"
      render={({ field }) => {
        return (
          <FormItem>
            <Turnstile
              siteKey={siteKey}
              options={{ size: "flexible", theme: cfTheme }}
              onSuccess={(token) => {
                formContext.resetField("captchaToken");
                field.onChange(token);
              }}
              onError={() => {
                formContext.setError("captchaToken", {
                  type: "validate",
                  message: "Captcha failed to load",
                });

                field.onChange(undefined);
              }}
              onExpire={() => {
                field.onChange(undefined);
              }}
              onUnsupported={() => {
                field.onChange(undefined);
                formContext.setError("captchaToken", {
                  type: "validate",
                  message: "Captcha isn't supported in this browser",
                });
              }}
              onTimeout={() => {
                field.onChange(undefined);
                formContext.setError("captchaToken", {
                  type: "validate",
                  message: "Captcha time out",
                });
              }}
            />

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

interface LoginContentProps {
  children?: ReactNode;
  hideOnSuccess?: SubmitData["type"] | SubmitData["type"][] | boolean;
}

const LoginContent = ({ children, hideOnSuccess }: LoginContentProps) => {
  const loginContext = useLoginContext();
  const formContext: unknown = useFormContext();

  if (!hideOnSuccess) {
    return children;
  }

  const type =
    hideOnSuccess !== true
      ? Array.isArray(hideOnSuccess)
        ? hideOnSuccess
        : [hideOnSuccess]
      : [];

  if (
    !loginContext.isSuccess ||
    !(
      formContext === null ||
      (loginContext.variables && type.includes(loginContext.variables.type))
    )
  ) {
    return children;
  }

  return null;
};

interface LoginSuccessProps {
  children?: ReactNode;
  type?: SubmitData["type"] | SubmitData["type"][] | null;
}

const LoginSuccess = ({ children, type: extType }: LoginSuccessProps) => {
  const loginContext = useLoginContext();
  const formContext = useFormContext();

  const type =
    extType !== undefined
      ? Array.isArray(extType)
        ? extType
        : [extType]
      : [formContext.getValues("type")];

  if (loginContext.isSuccess && type.includes(loginContext.variables?.type)) {
    return children;
  }

  return null;
};

interface LoginVariableProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

const LoginVariable = ({ name, ...rest }: LoginVariableProps) => {
  const loginContext = useLoginContext();
  const variable =
    loginContext.variables && name in loginContext.variables
      ? (loginContext.variables[name as keyof SubmitData] as string)
      : null;

  return <span {...rest}>{variable ?? null}</span>;
};

export {
  Login,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
  LoginOtpEmail,
  LoginFooter,
  LoginButton,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialGoogle,
  LoginSocialFacebook,
  LoginSocialDiscord,
  LoginSocialGithub,
  LoginErrorMessage,
  LoginCaptcha,
  LoginSuccess,
  LoginVariable,
  LoginContent,
};
