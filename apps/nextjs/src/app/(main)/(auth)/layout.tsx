import type { ReactNode } from "react";

import { AuthPage } from "@tonik/ui/recipes/auth-page";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <AuthPage appTitle="tonik">{children}</AuthPage>;
};

export default AuthLayout;
