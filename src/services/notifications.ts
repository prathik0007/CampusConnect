import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationApi } from './api';

// Configure how notifications are handled when the application is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Request notification permissions and obtain an Expo Push Token.
 * Gracefully handles unsupported environments (e.g. web, simulators without push support, or denied permissions).
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Web does not support standard Expo push tokens
  if (Platform.OS === 'web') {
    return null;
  }

  // Push notifications require a physical device or compatible environment
  if (!Device.isDevice) {
    console.log('[NotificationService] Running on simulator/virtual device. Push tokens are physical-device only.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NotificationService] Notification permission not granted by user.');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#208AEF',
      });
    }

    // Obtain the Expo push token
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    return tokenData.data;
  } catch (error: any) {
    // Fail gracefully without crashing the application
    console.warn('[NotificationService] Could not obtain push token:', error.message);
    return null;
  }
}

/**
 * Register push token with the backend server for the authenticated user
 */
export async function syncPushTokenWithBackend(jwtToken: string): Promise<boolean> {
  try {
    const pushToken = await registerForPushNotificationsAsync();
    if (!pushToken) {
      return false;
    }

    const res = await notificationApi.registerPushToken(pushToken, jwtToken);
    return res.success;
  } catch (error: any) {
    console.warn('[NotificationService] Syncing push token failed:', error.message);
    return false;
  }
}

/**
 * Subscribe to incoming notification and notification response (tap) listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
