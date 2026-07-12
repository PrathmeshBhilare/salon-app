import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as fbUpdatePassword,
  type User as FbUser,
} from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import { userService } from "./userService";
import { notificationService } from "./notificationService";
import type { BranchId } from "@/lib/types";

export const authService = {
  async login(email: string, password: string) {
    await signInWithEmailAndPassword(getAuthInstance(), email, password);
  },

  async register(input: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    preferredBranch: BranchId;
  }): Promise<{ uid: string; userId: string }> {
    const cred = await createUserWithEmailAndPassword(
      getAuthInstance(),
      input.email,
      input.password
    );
    const uid = cred.user.uid;
    const userId = await userService.createUser({
      uid,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      preferredBranch: input.preferredBranch,
      role: "customer",
    });
    await notificationService.create({
      recipientId: userId,
      title: "Welcome to Glow & Glamour",
      message: "Your account is ready. Book your first appointment!",
      kind: "system",
    });
    return { uid, userId };
  },

  async logout() {
    await signOut(getAuthInstance());
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(getAuthInstance(), email);
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const user = getAuthInstance().currentUser;
    if (!user || !user.email) throw new Error("No authenticated user.");
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await fbUpdatePassword(user, newPassword);
  },

  onAuthChanged(cb: (user: FbUser | null) => void) {
    return onAuthStateChanged(getAuthInstance(), cb);
  },

  currentUser(): FbUser | null {
    return getAuthInstance().currentUser;
  },
};
