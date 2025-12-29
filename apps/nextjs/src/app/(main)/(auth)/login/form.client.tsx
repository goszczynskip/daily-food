"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailIcon } from "lucide-react";

import {
  Login,
  LoginButton,
  LoginContent,
  LoginErrorMessage,
  LoginFooter,
  LoginOtpEmail,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialDiscord,
  LoginSocialGithub,
  LoginSocialGoogle,
  LoginSuccess,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
  LoginVariable,
} from "@tonik/auth-web/recipes/login";
import { Alert, AlertDescription, AlertTitle } from "@tonik/ui/alert";

import { api } from "~/trpc/react";

export const LoginForm = () => {
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const { isPending, ...login } = api.auth.login.useMutation({
    onSuccess: (data, variables) => {
      startTransition(() => {
        if (data?.url) {
          router.push(data.url);
        } else if (variables.type === "email") {
          router.push("/");
          router.refresh();
        }
      });
    },
  });

  return (
    <Login isPending={isPending || isTransitioning} {...login}>
      <LoginContent hideOnSuccess="otp-email">
        <LoginSocial>
          <LoginSocialGoogle />
          <LoginSocialGithub />
          <LoginSocialDiscord />
        </LoginSocial>
        <LoginSectionSplitter />
        <LoginErrorMessage />
        <LoginUsernamePassword>
          <LoginUsernamePasswordFields
            forgotPasswordLink={
              <Link href="/forgot-password">Forgot your password?</Link>
            }
          />

          <LoginButton type="email">Login</LoginButton>
        </LoginUsernamePassword>
        <LoginSectionSplitter />
        <LoginOtpEmail>
          <LoginButton type="otp-email">Continue</LoginButton>
        </LoginOtpEmail>

        <LoginFooter link={<Link href="/signup">Create one</Link>}>
          Don't have an account? —{" "}
        </LoginFooter>
      </LoginContent>

      <LoginSuccess type={"otp-email"}>
        <Alert variant="default" className="mb-2 text-left">
          <MailIcon className="size-4" />
          <AlertTitle>Check your email inbox</AlertTitle>
          <AlertDescription>
            We've sent a login email to{" "}
            <LoginVariable name="email" className="font-medium" />. Please check
            your email and follow the link to login.
          </AlertDescription>
        </Alert>

        <LoginFooter
          link={
            <button type="button" onClick={() => login.reset()}>
              Go back
            </button>
          }
        ></LoginFooter>
      </LoginSuccess>
    </Login>
  );
};
