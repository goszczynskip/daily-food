"use client";

import Link from "next/link";

import {
  ForgotPassword,
  ForgotPasswordErrorMessage,
  ForgotPasswordFooter,
  ForgotPasswordForm as ForgotPasswordFormRecipe,
  ForgotPasswordSuccessMessage,
  useForgotPasswordForm,
} from "@tonik/auth-web/recipes/forgot-password";

import { api } from "~/trpc/react";

export const ForgotPasswordForm = () => {
  const initPasswordReset = api.auth.initPasswordReset.useMutation({
    onSuccess: () => {
      forgotPasswordForm.reset();
    },
  });

  const forgotPasswordForm = useForgotPasswordForm({
    error: initPasswordReset.error,
  });

  return (
    <ForgotPassword {...initPasswordReset}>
      <ForgotPasswordSuccessMessage />
      <ForgotPasswordErrorMessage />
      <ForgotPasswordFormRecipe form={forgotPasswordForm} />
      <ForgotPasswordFooter link={<Link href="/login">Go back</Link>} />
    </ForgotPassword>
  );
};
