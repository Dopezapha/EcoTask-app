import { Platform, PermissionsAndroid } from 'react-native';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  deepLink?: string;
}

let onNotificationCallback: ((payload: NotificationPayload) => void) | null =
  null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS permission is handled by the system prompt when registering
  return true;
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // In production, this would use @react-native-firebase/messaging
    // or expo-notifications to get the device token
    // For now, return null as a placeholder
    return null;
  } catch {
    return null;
  }
}

export async function sendTokenToServer(token: string): Promise<void> {
  // POST token to backend for server-side push notification delivery
  // The backend stores this token and uses it to send targeted notifications
  try {
    const { default: api } = await import('../services/api');
    await api.post('/notifications/register', { token });
  } catch {
    // Best-effort registration
  }
}

export function onNotificationReceived(
  callback: (payload: NotificationPayload) => void,
): () => void {
  onNotificationCallback = callback;
  return () => {
    onNotificationCallback = null;
  };
}

// Notification types for EcoTask
export const NOTIFICATION_TYPES = {
  TASK_NEARBY: 'task_nearby',
  REWARD_CONFIRMED: 'reward_confirmed',
  PROOF_REJECTED: 'proof_rejected',
  STREAK_REMINDER: 'streak_reminder',
  NEW_TASK: 'new_task',
} as const;

export function scheduleLocalNotification(payload: NotificationPayload): void {
  // In production, use react-native-push-notification
  // or notifee for local notification scheduling
  if (onNotificationCallback) {
    onNotificationCallback(payload);
  }
}
