import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { BranchId, Role, User } from "@/lib/types";
import { generateUserId } from "@/lib/format";

function toUser(id: string, data: Record<string, unknown>): User {
  return { id: (data.userId as string) ?? id, ...(data as Omit<User, "id">) };
}

export const userService = {
  async generateUniqueUserId(): Promise<string> {
    const db = getDb();
    for (let i = 0; i < 8; i++) {
      const id = generateUserId();
      const snap = await getDocs(query(collection(db, "users"), where("userId", "==", id)));
      if (snap.empty) return id;
    }
    return generateUserId() + Math.floor(Math.random() * 9);
  },

  async createUser(input: {
    uid: string;
    fullName: string;
    phone: string;
    email: string;
    preferredBranch: BranchId;
    role: Role;
  }): Promise<string> {
    const db = getDb();
    const userId = await this.generateUniqueUserId();
    const now = new Date().toISOString();
    // Document ID = Firebase Auth UID so rules can verify role via get(/users/$(uid)).
    await setDoc(doc(db, "users", input.uid), {
      uid: input.uid,
      userId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      preferredBranch: input.preferredBranch,
      role: input.role,
      photoURL: "",
      status: "active",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },

  async getUserByUid(uid: string): Promise<User | null> {
    const db = getDb();
    const d = await getDoc(doc(db, "users", uid));
    return d.exists() ? toUser(d.id, d.data() as Record<string, unknown>) : null;
  },

  async get(userId: string): Promise<User | null> {
    const db = getDb();
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return toUser(d.id, d.data() as Record<string, unknown>);
  },

  async updateUser(userId: string, patch: Partial<User>) {
    const db = getDb();
    const ref = await this.refFor(userId);
    if (ref) await updateDoc(ref, { ...patch, updatedAt: new Date().toISOString() });
  },

  async refFor(userId: string) {
    const db = getDb();
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    return snap.empty ? null : doc(db, "users", snap.docs[0].id);
  },

  async listUsers(): Promise<User[]> {
    const db = getDb();
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => toUser(d.id, d.data() as Record<string, unknown>));
  },

  onUsers(cb: (users: User[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "users"), (snap) => {
      cb(snap.docs.map((d) => toUser(d.id, d.data() as Record<string, unknown>)));
    });
  },

  async convertToStaff(
    userId: string,
    data: { branch: BranchId; position: string; services: string[] }
  ) {
    const ref = await this.refFor(userId);
    if (!ref) throw new Error("User not found");
    await updateDoc(ref, {
      role: "staff",
      staffBranch: data.branch,
      staffPosition: data.position,
      staffServices: data.services,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },

  async toggleStaffActive(userId: string) {
    const ref = await this.refFor(userId);
    if (!ref) return;
    const d = await getDoc(ref);
    const active = !(d.data()?.active as boolean);
    await updateDoc(ref, { active, updatedAt: new Date().toISOString() });
  },
};
