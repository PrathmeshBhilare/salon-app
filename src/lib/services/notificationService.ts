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
  async deleteMultiple(ids: string[]) {
    const db = getDb();
    const { deleteDoc } = await import("firebase/firestore");
    await Promise.all(ids.map((id) => deleteDoc(doc(db, "notifications", id))));
  },
  async delete(id: string) {
    const db = getDb();
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "notifications", id));
  },
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
    const docData = {
      ...input,
      read: false,
      createdAt: new Date().toISOString(),
    } as any;
    
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });

    await addDoc(collection(db, "notifications"), docData);

    try {
      let q;
      if (input.recipientUid) {
        q = query(collection(db, "notifications"), where("recipientUid", "==", input.recipientUid));
      } else if (input.audience) {
        q = query(collection(db, "notifications"), where("audience", "==", input.audience));
      }
      
      if (q) {
        const snap = await getDocs(q);
        if (snap.docs.length > 30) {
          const sorted = snap.docs.sort((a, b) => {
            const dateA = a.data().createdAt || "";
            const dateB = b.data().createdAt || "";
            return dateB.localeCompare(dateA); // Newest first
          });
          const toDelete = sorted.slice(30);
          const { deleteDoc } = await import("firebase/firestore");
          await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
        }
      }
    } catch (e) {
      console.warn("Could not prune notifications", e);
    }
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
    recipientId: string, // This is actually the uid now
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
      query(collection(db, "notifications"), where("recipientUid", "==", recipientId)),
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
