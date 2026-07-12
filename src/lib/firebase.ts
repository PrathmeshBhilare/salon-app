import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 0 &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let messagingInstance: Messaging | null = null;

function init() {
  if (app || typeof window === "undefined" || !isFirebaseConfigured) return;
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  storageInstance = getStorage(app);
}

export function getApp(): FirebaseApp {
  if (!app) init();
  if (!app) throw new Error("Firebase is not configured. Add your keys to .env.local");
  return app;
}

export function getAuthInstance(): Auth {
  if (!authInstance) init();
  if (!authInstance) throw new Error("Firebase is not configured. Add your keys to .env.local");
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) init();
  if (!dbInstance) throw new Error("Firebase is not configured. Add your keys to .env.local");
  return dbInstance;
}

export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) init();
  if (!storageInstance) throw new Error("Firebase is not configured. Add your keys to .env.local");
  return storageInstance;
}

export function getMessagingInstance(): Messaging | null {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(getApp());
    } catch {
      messagingInstance = null;
    }
  }
  return messagingInstance;
}

export { firebaseConfig };
