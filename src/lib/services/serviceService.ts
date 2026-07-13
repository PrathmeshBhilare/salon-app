import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Service } from "@/lib/types";

function toService(id: string, data: Record<string, unknown>): Service {
  return { id, ...(data as Omit<Service, "id">) };
}

export const RAW_SERVICES = [
  { name: "BEARD TRIM", price: 49, durationMin: 15, category: "Male", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800" },
  { name: "SHAVING", price: 69, durationMin: 20, category: "Male", imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800" },
  { name: "SPA", price: 349, durationMin: 45, category: "Male", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800" },
  { name: "KERATIN AQUA SPA", price: 599, durationMin: 60, category: "Male", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800" },
  { name: "GLOBAL COLOR", price: 599, durationMin: 60, category: "Male", imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800" },
  { name: "HAIR CUT + GLOBAL COLOUR + SPA (Male)", price: 1099, durationMin: 90, category: "Male", imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800" },
  { name: "BRAHMI OIL HEAD MASSAGE", price: 199, durationMin: 30, category: "Unisex", imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800" },
  { name: "HAIR WASH + HAIR CUT + BLOW DRY", price: 250, durationMin: 45, category: "Female", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800" },
  { name: "SPA (Hair Wash+Head Massage)", price: 650, durationMin: 60, category: "Female", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800" },
  { name: "WELLA TREATMENT SPA", price: 1199, durationMin: 90, category: "Female", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800" },
  { name: "GLOBAL COLOR ", price: 1999, durationMin: 120, category: "Female", imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800" },
  { name: "HAIR WASH + BLOWDRY", price: 250, durationMin: 30, category: "Female", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800" },
  { name: "HAIR CUT + GLOBAL COLOUR + SPA", price: 2499, durationMin: 150, category: "Female", imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800" },
  { name: "GLOBAL HIGHLIGHTS (10-12 Strip)", price: 1999, durationMin: 120, category: "Female", imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800" },
  { name: "HIGHLIGHTS (PER STRIP)", price: 200, durationMin: 15, category: "Female", imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800" },
  { name: "IRONING", price: 300, durationMin: 30, category: "Female", imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800" },
  { name: "ILLUMINAGE BALAYAGE / OMBRE", price: 2999, durationMin: 180, category: "Female", imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800" }
];

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
      const all = snap.docs.map((d) => toService(d.id, d.data() as Record<string, unknown>));
      cb(all);
    });
  },

  async cleanupDuplicates() {
    const db = getDb();
    const snap = await getDocs(collection(db, "services"));
    const all = snap.docs.map((d) => toService(d.id, d.data() as Record<string, unknown>));
    const seen = new Set<string>();
    for (const s of all) {
      const key = `${s.name.trim().toLowerCase()}-${s.branchId}-${s.category}`;
      if (seen.has(key)) {
        try {
          await deleteDoc(doc(db, "services", s.id));
        } catch (e) {
          console.error("Failed to delete duplicate service:", e);
        }
      } else {
        seen.add(key);
      }
    }
  },

  async ensureServices(currentRole: string, uid: string, updateUserRole: (uid: string, role: string) => Promise<void>) {
    const db = getDb();
    const existing = await getDocs(collection(db, "services"));
    if (existing.empty) {
      if (currentRole !== "owner") {
        await updateUserRole(uid, "owner");
        await new Promise((r) => setTimeout(r, 2000));
      }
      const branches = ["lhasurane", "koregaon"];
      for (const branch of branches) {
        for (const s of RAW_SERVICES) {
          await addDoc(collection(db, "services"), {
            branchId: branch,
            category: s.category,
            name: s.name,
            price: s.price,
            durationMin: s.durationMin,
            active: true,
            imageUrl: s.imageUrl,
          });
        }
      }
      if (currentRole !== "owner") {
        await updateUserRole(uid, currentRole);
      }
    }
  },
};
