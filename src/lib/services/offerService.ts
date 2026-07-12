import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Offer } from "@/lib/types";

function toOffer(id: string, data: Record<string, unknown>): Offer {
  return { id, ...(data as Omit<Offer, "id">) };
}

export const offerService = {
  async add(input: Omit<Offer, "id">) {
    const db = getDb();
    const ref = await addDoc(collection(db, "offers"), input);
    return ref.id;
  },

  async update(id: string, patch: Partial<Offer>) {
    const db = getDb();
    await updateDoc(doc(db, "offers", id), patch as Record<string, unknown>);
  },

  async remove(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "offers", id));
  },

  onOffers(cb: (offers: Offer[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "offers"), (snap) => {
      cb(snap.docs.map((d) => toOffer(d.id, d.data() as Record<string, unknown>)));
    });
  },
};
