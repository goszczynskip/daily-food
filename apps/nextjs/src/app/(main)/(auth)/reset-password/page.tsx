import { notFound } from "next/navigation";

import {
  AuthPageContent,
  AuthPageFormContent,
  AuthPageFormTitle,
  AuthPageFormTitleDescription,
} from "@tonik/ui/recipes/auth-page";

import { api } from "~/trpc/rsc";
import { ResetPasswordForm } from "./form.client";

export default async function ResetPasswordPage() {
  const me = await api.auth.me();

  if (!me) {
    notFound();
  }

  return (
    <AuthPageContent>
      <AuthPageFormTitle>Reset your password</AuthPageFormTitle>
      <AuthPageFormTitleDescription>
        Enter your new password below to change it.
      </AuthPageFormTitleDescription>
      <AuthPageFormContent>
        <ResetPasswordForm />
      </AuthPageFormContent>
    </AuthPageContent>
  );
}
