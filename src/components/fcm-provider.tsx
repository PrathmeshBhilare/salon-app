"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance } from "@/lib/firebase";
import { userService } from "@/lib/services/userService";
import { useData } from "@/lib/store";
import { toast } from "sonner";

export function FCMProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useData();

  useEffect(() => {
    if (!currentUser) return;

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const messaging = getMessagingInstance();
          if (!messaging) return;

          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token && currentUser.fcmToken !== token) {
            await userService.saveFcmToken(currentUser.uid, token);
          }

          onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            toast(payload.notification?.title || "New Notification", {
              description: payload.notification?.body,
            });
          });
        }
      } catch (err) {
        console.error("FCM Setup failed:", err);
      }
    };

    setupFCM();
  }, [currentUser]);

  return <>{children}</>;
}
