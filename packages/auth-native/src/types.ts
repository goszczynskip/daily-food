import type { z } from "zod";

import type {
  loginRequestSchema,
  signupRequestSchema,
} from "@tonik/auth/schemas";

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;

export interface LoginContextValue {
  mutate: (data: LoginRequest) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
  variables?: LoginRequest;
}

export interface SignupContextValue {
  mutate: (data: SignupRequest) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
  variables?: SignupRequest;
}

export interface ForgotPasswordContextValue {
  mutate: (data: { email: string }) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
}

export interface ResetPasswordContextValue {
  mutate: (data: { password: string }) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
}
