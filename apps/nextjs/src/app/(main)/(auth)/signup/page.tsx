"use client";

import {
  AuthPageContent,
  AuthPageFormContent,
  AuthPageFormTitle,
  AuthPageFormTitleDescription,
} from "@tonik/ui/recipes/auth-page";

import { SignupForm } from "./form.client";

export default function SignupPage() {
  return (
    <AuthPageContent>
      <AuthPageFormTitle>Get started</AuthPageFormTitle>
      <AuthPageFormTitleDescription>
        Welcome to our platform! Enter your credentials to create an account.
      </AuthPageFormTitleDescription>
      <AuthPageFormContent>
        <SignupForm />
      </AuthPageFormContent>
    </AuthPageContent>
  );
}
