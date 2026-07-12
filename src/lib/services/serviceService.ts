import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Service } from "@/lib/types";

function toService(id: string, data: Record<string, unknown>): Service {
  return { id, ...(data as Omit<Service, "id">) };
}

export const serviceService = {
  async add(input: Omit<Service, "id">) {
    const db = getDb();
    const ref = await addDoc(collection(db, "services"), input);
    return ref.id;
  },

  async update(id: string, patch: Partial<Service>) {
    const db = getDb();
    await updateDoc(doc(db, "services", id), patch as Record<string, unknown>);
  },

  async remove(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "services", id));
  },

  onServices(cb: (services: Service[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "services"), (snap) => {
      cb(snap.docs.map((d) => toService(d.id, d.data() as Record<string, unknown>)));
    });
  },
};
