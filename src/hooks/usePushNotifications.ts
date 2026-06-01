import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

// Expo Go ne supporte plus les push depuis SDK 53 — on skip silencieusement
const IS_EXPO_GO = Constants.appOwnership === 'expo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function sendPushNotification(token: string, title: string, body: string) {
  if (!token || !token.startsWith('ExponentPushToken')) return;
  try {
    await fetch('https://exp.host/--/exponent-push-notification-server/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: token, sound: 'default', title, body }),
    });
  } catch (_) {}
}

export async function getPushTokenForUser(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', userId)
    .single();
  return data?.push_token ?? null;
}

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId || Platform.OS === 'web' || IS_EXPO_GO) return;

    const register = async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
    };

    register();
  }, [userId]);
}
