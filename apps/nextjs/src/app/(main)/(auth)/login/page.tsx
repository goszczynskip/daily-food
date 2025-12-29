import {
  AuthPageContent,
  AuthPageFormContent,
  AuthPageFormTitle,
  AuthPageFormTitleDescription,
} from "@tonik/ui/recipes/auth-page";

import { LoginForm } from "./form.client";

export default function LoginPage() {
  return (
    <AuthPageContent>
      <AuthPageFormTitle>Welcome back</AuthPageFormTitle>
      <AuthPageFormTitleDescription>
        Enter your credentials to access your account
      </AuthPageFormTitleDescription>
      <AuthPageFormContent>
        <LoginForm />
      </AuthPageFormContent>
    </AuthPageContent>
  );
}
