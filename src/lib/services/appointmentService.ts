import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Appointment } from "@/lib/types";

function toAppointment(id: string, data: Record<string, unknown>): Appointment {
  return { id, ...(data as Omit<Appointment, "id">) };
}

export const appointmentService = {
  async add(input: Omit<Appointment, "id">) {
    const db = getDb();
    const ref = await addDoc(collection(db, "appointments"), input);
    return ref.id;
  },

  async update(id: string, patch: Partial<Appointment>) {
    const db = getDb();
    await updateDoc(doc(db, "appointments", id), patch as Record<string, unknown>);
  },

  onAppointments(cb: (appointments: Appointment[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "appointments"), (snap) => {
      cb(snap.docs.map((d) => toAppointment(d.id, d.data() as Record<string, unknown>)));
    });
  },
};
