import {
  AuthPageContent,
  AuthPageFormContent,
  AuthPageFormTitle,
  AuthPageFormTitleDescription,
} from "@tonik/ui/recipes/auth-page";

import { ForgotPasswordForm } from "./form.client";

export default function ForgotPasswordPage() {
  return (
    <AuthPageContent>
      <AuthPageFormTitle>Forgot your password?</AuthPageFormTitle>
      <AuthPageFormTitleDescription>
        Enter email associated with your account to get password reset
        instructions.
      </AuthPageFormTitleDescription>
      <AuthPageFormContent>
        <ForgotPasswordForm />
      </AuthPageFormContent>
    </AuthPageContent>
  );
}
