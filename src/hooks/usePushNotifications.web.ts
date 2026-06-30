// Stub web — expo-notifications n'est pas disponible sur web
export async function sendPushNotification(_token: string, _title: string, _body: string) {}
export async function getPushTokenForUser(_userId: string): Promise<string | null> { return null; }
export function usePushNotifications(_userId: string | undefined) {}
