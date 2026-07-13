import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Branch, BranchId } from "@/lib/types";

const BRANCH_SEED: Record<BranchId, Omit<Branch, "nextToken" | "nowServing" | "waitingCount" | "inServiceCount" | "checkedInCount">> = {
  lhasurane: {
    id: "lhasurane",
    name: "Lhasurane",
    tagline: "Neighbourhood elegance, everyday glow.",
    address: "Shop 4, Lhasurane Main Road, Near City Bank",
    city: "Lhasurane",
    phone: "+91 98220 11223",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Lhasurane",
    lat: 19.2183,
    lng: 72.9781,
    isOpen: true,
    availableChairs: 3,
    totalChairs: 4,
    workingHours: [
      { day: "Mon", open: "09:00", close: "20:00" },
      { day: "Tue", open: "09:00", close: "20:00" },
      { day: "Wed", open: "09:00", close: "20:00" },
      { day: "Thu", open: "09:00", close: "20:00" },
      { day: "Fri", open: "09:00", close: "20:00" },
      { day: "Sat", open: "09:00", close: "21:00" },
      { day: "Sun", open: "10:00", close: "18:00" },
    ],
  },
  koregaon: {
    id: "koregaon",
    name: "Koregaon",
    tagline: "Full-service beauty & unisex salon.",
    address: "Plot 12, Koregaon Park Annexe, Lane 7",
    city: "Koregaon",
    phone: "+91 98220 44556",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Koregaon",
    lat: 18.5362,
    lng: 73.8923,
    isOpen: true,
    availableChairs: 4,
    totalChairs: 6,
    workingHours: [
      { day: "Mon", open: "09:30", close: "21:00" },
      { day: "Tue", open: "09:30", close: "21:00" },
      { day: "Wed", open: "09:30", close: "21:00" },
      { day: "Thu", open: "09:30", close: "21:00" },
      { day: "Fri", open: "09:30", close: "21:00" },
      { day: "Sat", open: "09:00", close: "22:00" },
      { day: "Sun", open: "09:00", close: "20:00" },
    ],
  },
};

function toBranch(id: string, data: Record<string, unknown>): Branch {
  return { id: id as BranchId, ...(data as Omit<Branch, "id">) };
}

export const branchService = {
  async ensureBranches() {
    const db = getDb();
    for (const id of Object.keys(BRANCH_SEED) as BranchId[]) {
      const ref = doc(db, "branches", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const defaults = { nextToken: 0, nowServing: null, waitingCount: 0, inServiceCount: 0, checkedInCount: 0 };
        await updateDoc(ref, { ...BRANCH_SEED[id], ...defaults }).catch(
          async () => {
            await setDoc(ref, { ...BRANCH_SEED[id], ...defaults });
          }
        );
      }
    }
  },

  onBranches(cb: (branches: Branch[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "branches"), (snap) => {
      cb(snap.docs.map((d) => toBranch(d.id, d.data() as Record<string, unknown>)));
    });
  },

  async updateBranch(id: BranchId, patch: Partial<Branch>) {
    const db = getDb();
    await updateDoc(doc(db, "branches", id), patch as Record<string, unknown>);
  },

  async assignToken(id: BranchId): Promise<number> {
    const db = getDb();
    const ref = doc(db, "branches", id);
    return runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const current = (snap.data()?.nextToken as number) ?? 0;
      const next = current + 1;
      tx.update(ref, { nextToken: next });
      return next;
    });
  },

  async setNowServing(id: BranchId, token: number | null) {
    const db = getDb();
    await updateDoc(doc(db, "branches", id), { nowServing: token });
  },

  async incrementStats(id: BranchId, stats: { waiting?: number; inService?: number; checkedIn?: number }) {
    const db = getDb();
    const patch: Record<string, any> = {};
    if (stats.waiting) patch.waitingCount = increment(stats.waiting);
    if (stats.inService) patch.inServiceCount = increment(stats.inService);
    if (stats.checkedIn) patch.checkedInCount = increment(stats.checkedIn);
    
    if (Object.keys(patch).length > 0) {
      await updateDoc(doc(db, "branches", id), patch).catch(e => {
        console.error("Failed to increment branch stats:", e);
      });
    }
  },
};
