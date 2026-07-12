import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { userService } from "./userService";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const fcmService = {
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  async getToken(): Promise<string | null> {
    const messaging = getMessagingInstance();
    if (!messaging || !VAPID_KEY) return null;
    try {
      return await getToken(messaging, { vapidKey: VAPID_KEY });
    } catch {
      return null;
    }
  },

  async register(userId: string): Promise<void> {
    const granted = await this.requestPermission();
    if (!granted) return;
    const token = await this.getToken();
    if (token) await userService.updateUser(userId, { fcmToken: token } as never);
  },

  onForegroundMessage(cb: (payload: MessagePayload) => void) {
    const messaging = getMessagingInstance();
    if (!messaging) return () => {};
    return onMessage(messaging, cb);
  },
};
