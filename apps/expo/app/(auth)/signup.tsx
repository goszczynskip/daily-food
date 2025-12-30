import { View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/src/providers/auth-provider";
import { api } from "@/src/trpc/react";

import {
  Signup,
  SignupContent,
  SignupErrorMessage,
  SignupFooter,
  SignupForm,
  SignupFormFields,
  SignupSectionSplitter,
  SignupSocial,
  SignupSocialApple,
  SignupSocialGoogle,
  SignupSuccess,
} from "@tonik/auth-native/recipes/signup";
import { Text } from "@tonik/ui-native";

export default function SignupScreen() {
  const signupMutation = api.auth.signup.useMutation();
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <Signup
      mutate={signupMutation.mutate}
      isPending={signupMutation.isPending}
      error={signupMutation.error}
      isSuccess={signupMutation.isSuccess}
      variables={signupMutation.variables}
    >
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-center text-3xl font-bold">
          Create Account
        </Text>
        <Text className="text-muted-foreground mb-8 text-center">
          Sign up to get started
        </Text>

        <SignupContent hideOnSuccess="email">
          <SignupSocial>
            <SignupSocialApple onPress={signInWithApple} />
            <SignupSocialGoogle onPress={signInWithGoogle} />
          </SignupSocial>

          <SignupSectionSplitter />

          <SignupErrorMessage />

          <SignupForm>
            <SignupFormFields />
          </SignupForm>

          <SignupFooter
            link={
              <Link href="/login" className="text-primary font-medium">
                Sign in
              </Link>
            }
          >
            Already have an account?{" "}
          </SignupFooter>
        </SignupContent>

        <SignupSuccess type="email">
          <Text className="mb-2 text-xl font-semibold">Check your email</Text>
          <Text className="text-muted-foreground text-center">
            We've sent a confirmation link to your email
          </Text>
        </SignupSuccess>
      </View>
    </Signup>
  );
}
