import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { setupNotificationListeners, syncPushTokenWithBackend } from '@/services/notifications';

SplashScreen.preventAutoHideAsync();

function AppNotificationHandler() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Sync push token with backend after successful authentication
    if (isAuthenticated && token) {
      syncPushTokenWithBackend(token).catch(() => {});
    }

    // 2. Set up notification listeners (tap navigation)
    const cleanup = setupNotificationListeners(
      undefined,
      (response) => {
        try {
          const data = response?.notification?.request?.content?.data;
          if (data?.eventId && typeof data.eventId === 'string') {
            router.push(`/event/${data.eventId}` as any);
          } else {
            router.push('/(student)/notifications' as any);
          }
        } catch (err) {
          console.warn('[Notification Tap] Navigation error:', err);
        }
      }
    );

    return cleanup;
  }, [isAuthenticated, token]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <EventProvider>
          <AppNotificationHandler />
          <AnimatedSplashOverlay />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(organizer)" />
            <Stack.Screen
              name="event/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="event-edit/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
