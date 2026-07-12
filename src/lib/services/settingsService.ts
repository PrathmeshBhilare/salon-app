import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export interface AppSettings {
  autoConfirm: boolean;
  allowWalkIn: boolean;
  reminders: boolean;
  weekendOnlyOffer: boolean;
  notifyBooking: boolean;
  notifyOffers: boolean;
  notifyAnnouncements: boolean;
  theme: "light" | "dark";
}

const DEFAULT_SETTINGS: AppSettings = {
  autoConfirm: false,
  allowWalkIn: true,
  reminders: true,
  weekendOnlyOffer: false,
  notifyBooking: true,
  notifyOffers: true,
  notifyAnnouncements: true,
  theme: "light",
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    const db = getDb();
    const d = await getDoc(doc(db, "settings", "app"));
    return d.exists() ? { ...DEFAULT_SETTINGS, ...(d.data() as AppSettings) } : DEFAULT_SETTINGS;
  },

  async save(settings: Partial<AppSettings>) {
    const db = getDb();
    await setDoc(doc(db, "settings", "app"), settings, { merge: true });
  },
};
