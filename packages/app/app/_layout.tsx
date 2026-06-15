import type { JSX } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// eslint-disable-next-line import/no-default-export
export default function RootLayout(): JSX.Element {
    return (
        <SafeAreaProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
            </Stack>
        </SafeAreaProvider>
    );
}
