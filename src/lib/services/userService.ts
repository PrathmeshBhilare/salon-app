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
  return { id, ...(data as Omit<User, "id">) };
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
    await setDoc(doc(db, "users", userId), {
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
    const snap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return toUser(d.id, d.data() as Record<string, unknown>);
  },

  async get(userId: string): Promise<User | null> {
    const db = getDb();
    const d = await getDoc(doc(db, "users", userId));
    return d.exists() ? toUser(d.id, d.data() as Record<string, unknown>) : null;
  },

  async updateUser(userId: string, patch: Partial<User>) {
    const db = getDb();
    await updateDoc(doc(db, "users", userId), {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
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
    const db = getDb();
    await updateDoc(doc(db, "users", userId), {
      role: "staff",
      staffBranch: data.branch,
      staffPosition: data.position,
      staffServices: data.services,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },

  async toggleStaffActive(userId: string) {
    const db = getDb();
    const d = await getDoc(doc(db, "users", userId));
    if (!d.exists()) return;
    const active = !(d.data().active as boolean);
    await updateDoc(doc(db, "users", userId), { active, updatedAt: new Date().toISOString() });
  },
};
