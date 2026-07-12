import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AppNotification, Role } from "@/lib/types";

function toNotification(id: string, data: Record<string, unknown>): AppNotification {
  return { id, ...(data as Omit<AppNotification, "id">) };
}

export const notificationService = {
  async create(input: {
    recipientId?: string;
    recipientUid?: string;
    audience?: Role;
    branchId?: string;
    title: string;
    message: string;
    kind: AppNotification["kind"];
  }) {
    const db = getDb();
    await addDoc(collection(db, "notifications"), {
      ...input,
      read: false,
      createdAt: new Date().toISOString(),
    });
  },

  async markRead(id: string) {
    const db = getDb();
    await updateDoc(doc(db, "notifications", id), { read: true });
  },

  async markAllRead(recipientId: string) {
    const db = getDb();
    const snap = await getDocs(
      query(collection(db, "notifications"), where("recipientId", "==", recipientId), where("read", "==", false))
    );
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  },

  onNotifications(
    recipientId: string,
    role: Role,
    cb: (list: AppNotification[]) => void
  ) {
    const db = getDb();
    const map = new Map<string, AppNotification>();
    const emit = () => {
      const arr = Array.from(map.values()).sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
      cb(arr);
    };
    const unsub1 = onSnapshot(
      query(collection(db, "notifications"), where("recipientId", "==", recipientId)),
      (snap) => {
        snap.docChanges().forEach((c) => {
          if (c.type === "removed") map.delete(c.doc.id);
          else map.set(c.doc.id, toNotification(c.doc.id, c.doc.data() as Record<string, unknown>));
        });
        emit();
      }
    );
    const unsub2 = onSnapshot(
      query(collection(db, "notifications"), where("audience", "==", role)),
      (snap) => {
        snap.docChanges().forEach((c) => {
          if (c.type === "removed") map.delete(c.doc.id);
          else map.set(c.doc.id, toNotification(c.doc.id, c.doc.data() as Record<string, unknown>));
        });
        emit();
      }
    );
    return () => {
      unsub1();
      unsub2();
    };
  },
};
