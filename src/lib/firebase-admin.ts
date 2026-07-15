import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

function initializeFirebaseAdmin() {
  if (getApps().length > 0) return;

  try {
    // 1. Try to load from FIREBASE_SERVICE_ACCOUNT_KEY env var (Best for Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
      });
      return;
    }

    // 2. Try to load from individual env vars (Alternative for Vercel)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      return;
    }

    // 3. Try to load from local file using fs to bypass Next.js static analysis (For local dev)
    if (typeof window === "undefined") {
      const fs = require("fs");
      const path = require("path");
      const localPath = path.join(process.cwd(), "serviceAccountKey.json");
      if (fs.existsSync(localPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(localPath, "utf-8"));
        initializeApp({
          credential: cert(serviceAccount),
        });
        return;
      }
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

initializeFirebaseAdmin();

export const adminMessaging = getApps().length > 0 ? getMessaging() : null as any;
export const adminDb = getApps().length > 0 ? getFirestore() : null as any;
