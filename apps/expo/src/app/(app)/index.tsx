import { Text, View } from 'react-native';

import { useAuthStore } from '@tonik/auth-native';

export default function Index() {
  const { logout, user } = useAuthStore();
  return (
    <View className='flex items-center justify-center'>
      <Text>
        Hello {user?.email ?? "anon"}
      </Text>
      <Text
        onPress={() => {
          // The guard in `RootNavigator` redirects back to the sign-in screen.
          logout();
        }}>
        Log Out
      </Text>
    </View>
  );
}
