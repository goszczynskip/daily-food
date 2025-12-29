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
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialDiscord,
  LoginSocialGithub,
  LoginSocialGoogle,
  LoginSuccess,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
  LoginVariable,
} from "@tonik/auth/recipes/login";
import { Alert, AlertDescription, AlertTitle } from "@tonik/ui/alert";

import { api } from "~/trpc/react";

export const SignupForm = () => {
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const { isPending, ...signup } = api.auth.signup.useMutation({
    onSuccess: (data) => {
      startTransition(() => {
        if (data?.url) {
          router.push(data.url);
        }
      });
    },
  });

  return (
    <Login isPending={isPending || isTransitioning} {...signup}>
      <LoginSuccess type={["email", "otp-email"]}>
        <Alert variant="default" className="mb-2 text-left">
          <MailIcon className="size-4" />
          <AlertTitle>Verify your email address</AlertTitle>
          <AlertDescription>
            We've sent a verification email to{" "}
            <LoginVariable name="email" className="font-medium" />. Please check
            your email and follow the link to complete your signup.
          </AlertDescription>
        </Alert>

        <LoginFooter link={<Link href="/">Go to Homepage</Link>}></LoginFooter>
      </LoginSuccess>

      <LoginContent hideOnSuccess={["otp-email", "email"]}>
        <LoginSocial>
          <LoginSocialGoogle />
          <LoginSocialGithub />
          <LoginSocialDiscord />
        </LoginSocial>
        <LoginSectionSplitter />
        <LoginErrorMessage />
        <LoginUsernamePassword>
          <LoginUsernamePasswordFields />
          <LoginButton>Signup</LoginButton>
        </LoginUsernamePassword>

        <LoginFooter link={<Link href="/login">Login</Link>}>
          Have an account? —{" "}
        </LoginFooter>
      </LoginContent>
    </Login>
  );
};
