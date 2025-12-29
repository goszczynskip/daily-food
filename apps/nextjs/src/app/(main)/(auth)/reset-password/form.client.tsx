"use client";

import Link from "next/link";

import {
  ResetPassword,
  ResetPasswordErrorMessage,
  ResetPasswordFooter,
  ResetPasswordForm as ResetPasswordFormRecipe,
  ResetPasswordSuccessMessage,
  useResetPasswordForm,
} from "@tonik/auth-web/recipes/reset-password";

import { api } from "~/trpc/react";

export const ResetPasswordForm = () => {
  const resetPassword = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      resetPasswordForm.reset();
    },
  });

  const resetPasswordForm = useResetPasswordForm({
    error: resetPassword.error,
  });

  return (
    <ResetPassword {...resetPassword}>
      <ResetPasswordSuccessMessage />
      <ResetPasswordErrorMessage />
      <ResetPasswordFormRecipe form={resetPasswordForm} />
      <ResetPasswordFooter link={<Link href="/login">Go back</Link>} />
    </ResetPassword>
  );
};
