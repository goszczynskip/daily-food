import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { otpEmailSchema } from "@tonik/auth";

import { useAuth } from "../provider";

interface LoginScreenProps {
  onSuccess?: () => void;
  showApple?: boolean;
  showGoogle?: boolean;
}

export function LoginScreen({
  onSuccess,
  showApple = Platform.OS === "ios",
  showGoogle = true,
}: LoginScreenProps) {
  const { signInWithApple, signInWithGoogle, signInWithMagicLink, isLoading } =
    useAuth();

  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const handleAppleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithApple();
      onSuccess?.();
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "Failed to sign in with Apple",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    const result = otpEmailSchema.safeParse({ email });
    if (!result.success) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await signInWithMagicLink(email);

      if (response.success) {
        setEmailSent(true);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send magic link",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a login link to {email}
          </Text>
          <Pressable
            style={styles.linkButton}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.linkButtonText}>Use a different email</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          {showApple && (
            <Pressable
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={isSubmitting}
            >
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </Pressable>
          )}

          {showGoogle && (
            <Pressable
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                Continue with Google
              </Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Magic Link */}
        <View style={styles.emailContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Pressable
            style={[
              styles.magicLinkButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleMagicLink}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.magicLinkButtonText}>
                Email me a sign-in link
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 32,
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appleButtonText: {
    color: "#fff",
  },
  googleButtonText: {
    color: "#374151",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
  },
  emailContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  magicLinkButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  magicLinkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "500",
  },
});
