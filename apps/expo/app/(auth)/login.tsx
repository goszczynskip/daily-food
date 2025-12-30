import { useRouter } from "expo-router";

import { LoginScreen } from "@tonik/auth-native";

export default function Login() {
  const router = useRouter();

  return (
    <>
      <LoginScreen
        onSuccess={() => {
          router.replace("/(tabs)");
        }}
      />
    </>
  );
}
