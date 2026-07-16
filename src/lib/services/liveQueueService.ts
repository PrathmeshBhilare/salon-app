import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, deleteDoc } from "firebase/firestore";
import { getDb } from "../firebase";
import { LiveQueueEntry } from "../types";

const COLLECTION = "liveQueue";

export const liveQueueService = {
  listen(callback: (queue: LiveQueueEntry[]) => void): () => void {
    const db = getDb();
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as LiveQueueEntry[];
        callback(data);
      },
      (err) => {
        console.error("LiveQueue listen error:", err);
      }
    );
  },

  async addToQueue(entry: Omit<LiveQueueEntry, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const db = getDb();
    const ref = doc(collection(db, COLLECTION));
    const now = new Date().toISOString();
    await setDoc(ref, {
      ...entry,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async updateQueueStatus(id: string, status: LiveQueueEntry["status"], additionalFields: Partial<LiveQueueEntry> = {}): Promise<void> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString(),
      ...additionalFields,
    });
  },
  
  async removeFromQueue(id: string): Promise<void> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  },

  // Helper to fetch single queue entry by appointment ID if needed
  async getByAppointmentId(appointmentId: string): Promise<LiveQueueEntry | null> {
    // This is a naive client side find if we have the list, but we can do a query if needed.
    // For simplicity, we'll let the Store manage the state.
    return null; 
  }
};
