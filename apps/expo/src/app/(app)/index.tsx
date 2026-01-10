import { Text, View } from "react-native";

import { useAuthStore } from "@tonik/auth-native";

export default function Index() {
  const logout = useAuthStore((s) => s.logout);
  const session = useAuthStore((s) => s.session);

  return (
    <View className="flex items-center justify-center">
      <Text>Hello {session?.user?.email ?? "anon"}</Text>
      <Text
        onPress={() => {
          // The guard in `RootNavigator` redirects back to the sign-in screen.
          logout();
        }}
      >
        Log Out
      </Text>
    </View>
  );
}
