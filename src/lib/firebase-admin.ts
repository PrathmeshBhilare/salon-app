import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../serviceAccountKey.json";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
}

export const adminMessaging = getMessaging();
export const adminDb = getFirestore();
