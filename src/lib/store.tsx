"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Appointment,
  AppNotification,
  Branch,
  BranchId,
  Offer,
  QueueEntry,
  Role,
  Service,
  ShopStatus,
  User,
} from "./types";
import { BRANCHES, STATUS_LABELS } from "./types";
import {
  addDaysISO,
  generateReference,
  todayISO,
} from "./format";
import { authService } from "./services/authService";
import { userService } from "./services/userService";
import { branchService } from "./services/branchService";
import { serviceService } from "./services/serviceService";
import { offerService } from "./services/offerService";
import { appointmentService } from "./services/appointmentService";
import { notificationService } from "./services/notificationService";

const AVG_SERVICE_MIN = 30;

export const DEFAULT_BRANCHES: Branch[] = [
  {
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
    nextToken: 0,
    nowServing: null,
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
  {
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
    nextToken: 0,
    nowServing: null,
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
];

interface DataContextValue {
  ready: boolean;
  users: User[];
  branches: Branch[];
  services: Service[];
  offers: Offer[];
  appointments: Appointment[];
  queue: Record<string, QueueEntry[]>;
  notifications: AppNotification[];
  serving: Record<string, number | null>;
  currentUser: User | null;
  activeBranchId: BranchId;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    preferredBranch: BranchId;
  }) => Promise<{ ok: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  updatePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  setActiveBranch: (id: BranchId) => void;
  bookAppointment: (input: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    branchId: BranchId;
    serviceIds: string[];
    date: string;
    time: string;
    notes?: string;
  }) => Promise<Appointment>;
  confirmAppointment: (id: string) => Promise<void>;
  rejectAppointment: (id: string) => Promise<void>;
  checkInAppointment: (id: string) => Promise<void>;
  startService: (id: string, staffId?: string) => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  joinWalkIn: (branchId: BranchId, customerName: string, serviceIds: string[]) => Promise<QueueEntry>;
  callNext: (branchId: BranchId) => Promise<void>;
  leaveQueue: (branchId: BranchId, token: number) => Promise<void>;
  convertToStaff: (
    userId: string,
    data: { branch: BranchId; position: string; services: string[] }
  ) => Promise<{ ok: boolean; error?: string }>;
  toggleStaffActive: (userId: string) => Promise<void>;
  addService: (s: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, patch: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleService: (id: string) => Promise<void>;
  addOffer: (o: Omit<Offer, "id">) => Promise<void>;
  updateOffer: (id: string, patch: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOffer: (id: string) => Promise<void>;
  notify: (input: Partial<AppNotification> & { title: string; message: string; kind: AppNotification["kind"] }) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  notificationsFor: (user: User) => AppNotification[];
  unreadCount: (user: User) => number;
  getBranch: (id: BranchId) => Branch;
  getServicesFor: (branchId: BranchId) => Service[];
  getOffersFor: (branchId: BranchId) => Offer[];
  getAppointmentsForBranch: (branchId: BranchId) => Appointment[];
  getShopStatus: (branchId: BranchId) => ShopStatus;
}

const DataContext = createContext<DataContextValue | null>(null);

function deriveQueue(appointments: Appointment[]): Record<string, QueueEntry[]> {
  const m: Record<string, QueueEntry[]> = { lhasurane: [], koregaon: [] };
  for (const a of appointments) {
    if (a.status === "checked_in" && a.token != null) {
      m[a.branchId].push({
        token: a.token,
        appointmentId: a.id,
        customerName: a.customerName,
        branchId: a.branchId,
        isWalkIn: a.isWalkIn,
        joinedAt: a.queuedAt || a.createdAt,
      });
    }
  }
  for (const b of BRANCHES) {
    m[b].sort((x, y) => (x.joinedAt || "").localeCompare(y.joinedAt || ""));
  }
  return m;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<BranchId>("lhasurane");
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [services, setServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const listeners = useRef<Array<() => void>>([]);

  const queue = useMemo(() => deriveQueue(appointments), [appointments]);
  const serving = useMemo(() => {
    const m: Record<string, number | null> = { lhasurane: null, koregaon: null };
    for (const b of branches) m[b.id] = b.nowServing ?? null;
    return m;
  }, [branches]);

  const cleanup = useCallback(() => {
    listeners.current.forEach((u) => u());
    listeners.current = [];
  }, []);

  useEffect(() => {
    const unsub = authService.onAuthChanged(async (fbUser) => {
      cleanup();
      if (!fbUser) {
        setCurrentUser(null);
        setBranches([]);
        setServices([]);
        setOffers([]);
        setAppointments([]);
        setNotifications([]);
        setUsers([]);
        setReady(true);
        return;
      }
      try {
        await branchService.ensureBranches();
      } catch {
        /* ignore if offline */
      }
      try {
        let user = await userService.getUserByUid(fbUser.uid);
        
        // Auto-recover if the user exists in Firebase Auth but missing in Firestore
        // (e.g., if they were created manually in the console or previous write failed)
        if (!user) {
          console.log("Firestore profile missing, auto-creating...");
          const userId = await userService.createUser({
            uid: fbUser.uid,
            fullName: fbUser.displayName || "User",
            phone: fbUser.phoneNumber || "",
            email: fbUser.email || "",
            preferredBranch: "lhasurane",
            role: "customer",
          });
          user = await userService.get(userId);
        }

        if (!user) {
          setCurrentUser(null);
          setReady(true);
          return;
        }
        // Auto-promote the designated owner email
        const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
        if (ownerEmail && user.email.toLowerCase() === ownerEmail.toLowerCase() && user.role !== "owner") {
          await userService.updateUser(user.id, { role: "owner", ownerBranch: "lhasurane" as BranchId });
          user.role = "owner";
          user.ownerBranch = "lhasurane";
        }
        setCurrentUser(user);

        try {
          await serviceService.ensureServices(user.role, user.uid, async (uid, role) => {
            await userService.updateUserByUid(uid, { role: role as any });
          });
        } catch {
          /* ignore if offline or failing */
        }

        setActiveBranchId(
          user.role === "customer"
            ? user.preferredBranch
            : (user.staffBranch ?? user.ownerBranch ?? "lhasurane")
        );
        const unsubs: Array<() => void> = [];
        unsubs.push(userService.onUser(fbUser.uid, (updatedUser) => {
          if (updatedUser) setCurrentUser(updatedUser);
        }));
        unsubs.push(branchService.onBranches((b) => setBranches(b.length > 0 ? b : DEFAULT_BRANCHES)));
        unsubs.push(serviceService.onServices(setServices));
        unsubs.push(offerService.onOffers(setOffers));
        unsubs.push(appointmentService.onAppointments(
          user.role, 
          user.uid, 
          user.staffBranch ?? null, 
          setAppointments
        ));
        unsubs.push(notificationService.onNotifications(user.uid, user.role, setNotifications));
        if (user.role === "owner") unsubs.push(userService.onUsers(setUsers));
        listeners.current = unsubs;
      } catch (e) {
        console.error("Failed to load user profile:", e);
        await authService.logout();
        setCurrentUser(null);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, [cleanup]);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      await authService.login(identifier.trim(), password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }, []);

  const register = useCallback(
    async (input: {
      fullName: string;
      phone: string;
      email: string;
      password: string;
      preferredBranch: BranchId;
    }) => {
      try {
        const { userId } = await authService.register(input);
        const user = await userService.get(userId);
        return { ok: true, user: user ?? undefined };
      } catch (e) {
        return { ok: false, error: friendlyAuthError(e) };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    cleanup();
    await authService.logout();
  }, [cleanup]);

  const updatePassword = useCallback(async (current: string, next: string) => {
    try {
      await authService.updatePassword(current, next);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }, []);

  const setActiveBranch = useCallback((id: BranchId) => setActiveBranchId(id), []);

  const bookAppointment = useCallback<DataContextValue["bookAppointment"]>(
    async (input) => {
      const now = new Date().toISOString();
      const appt: Appointment = {
        reference: Math.random().toString(36).substring(2, 8).toUpperCase(),
        customerId: input.customerId,
        customerUid: currentUser?.uid || input.customerId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        branchId: input.branchId,
        serviceIds: input.serviceIds,
        date: input.date,
        time: input.time,
        status: "pending",
        isWalkIn: false,
        token: null,
        createdAt: now,
      } as Appointment;
      if (input.notes) appt.notes = input.notes;

      const id = await appointmentService.add(appt);
      appt.id = id;
      await notificationService.create({
        recipientId: input.customerId,
        recipientUid: currentUser?.uid || input.customerId,
        title: "Booking Received",
        message: `Your appointment at ${branchLabel(input.branchId)} is pending confirmation.`,
        kind: "booking",
      });
      await notificationService.create({
        audience: "staff",
        branchId: input.branchId,
        title: "New Booking",
        message: `${input.customerName} booked for ${input.date} at ${input.time}.`,
        kind: "booking",
      });
      await notificationService.create({
        audience: "owner",
        title: "New Booking",
        message: `${input.customerName} booked at ${branchLabel(input.branchId)}.`,
        kind: "booking",
      });
      return appt;
    },
    [currentUser]
  );

  const confirmAppointment = useCallback(async (id: string) => {
    try {
      const a = appointments.find((x) => x.id === id);
      if (!a) return;
      await appointmentService.update(id, {
        status: "confirmed",
        confirmedBy: currentUser?.id,
        confirmedAt: new Date().toISOString(),
      });
      await notificationService.create({
        recipientId: a.customerId,
        recipientUid: a.customerUid,
        title: "Booking Confirmed",
        message: `Your appointment on ${a.date} at ${a.time} is confirmed.`,
        kind: "booking",
      });
    } catch (e: any) {
      console.error("confirmAppointment internal error:", e);
      throw e;
    }
  }, [appointments, currentUser]);

  const rejectAppointment = useCallback(async (id: string) => {
    try {
      const a = appointments.find((x) => x.id === id);
      if (!a) return;
      await appointmentService.update(id, { status: "rejected" });
      await notificationService.create({
        recipientId: a.customerId,
        recipientUid: a.customerUid,
        title: "Booking Rejected",
        message: `Sorry, your appointment on ${a.date} could not be accommodated.`,
        kind: "cancel",
      });
    } catch (e: any) {
      console.error("rejectAppointment internal error:", e);
      throw e;
    }
  }, [appointments]);

  const checkInAppointment = useCallback(async (id: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    const token = await branchService.assignToken(a.branchId);
    await appointmentService.update(id, {
      status: "checked_in",
      token,
      queuedAt: new Date().toISOString(),
    });
  }, [appointments]);

  const startService = useCallback(async (id: string, staffId?: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    await appointmentService.update(id, {
      status: "in_service",
      assignedStaffId: staffId ?? currentUser?.id,
    });
    if (a.token != null) await branchService.setNowServing(a.branchId, a.token);
  }, [appointments, currentUser]);

  const completeAppointment = useCallback(async (id: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    await appointmentService.update(id, { status: "completed", token: null });
    if (a.token != null && serving[a.branchId] === a.token)
      await branchService.setNowServing(a.branchId, null);
  }, [appointments, serving]);

  const markNoShow = useCallback(async (id: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    await appointmentService.update(id, { status: "no_show", token: null });
    if (a.token != null && serving[a.branchId] === a.token)
      await branchService.setNowServing(a.branchId, null);
  }, [appointments, serving]);

  const cancelAppointment = useCallback(async (id: string) => {
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    await appointmentService.update(id, { status: "cancelled", token: null });
    await notificationService.create({
      recipientId: a.customerId,
      recipientUid: a.customerUid,
      title: "Booking Cancelled",
      message: `Your appointment on ${a.date} has been cancelled by the salon.`,
      kind: "cancel",
    });
    if (a.token != null && serving[a.branchId] === a.token)
      await branchService.setNowServing(a.branchId, null);
  }, [appointments, serving]);

  const joinWalkIn = useCallback<DataContextValue["joinWalkIn"]>(
    async (branchId, customerName, serviceIds) => {
      const now = new Date().toISOString();
      const token = await branchService.assignToken(branchId);
      const appt: Omit<Appointment, "id"> = {
        reference: generateReference(),
        customerId: "walkin",
        customerName,
        customerPhone: "—",
        branchId,
        serviceIds: serviceIds.length ? serviceIds : [branchId === "lhasurane" ? "svc_lh_1" : "svc_ko_1"],
        date: todayISO(),
        time: new Date().toTimeString().slice(0, 5),
        status: "checked_in",
        isWalkIn: true,
        token,
        createdAt: now,
        queuedAt: now,
      };
      const id = await appointmentService.add(appt);
      await notificationService.create({
        audience: "staff",
        branchId,
        title: "Walk-in Joined",
        message: `${customerName} joined the queue at ${branchLabel(branchId)}.`,
        kind: "queue",
      });
      return {
        token,
        appointmentId: id,
        customerName,
        branchId,
        isWalkIn: true,
        joinedAt: now,
      };
    },
    []
  );

  const callNext = useCallback(
    async (branchId: BranchId) => {
      const q = queue[branchId] ?? [];
      if (q.length === 0) return;
      const id = q[0].appointmentId;
      if (!id) return;
      await startService(id, currentUser?.id);
    },
    [queue, startService, currentUser]
  );

  const leaveQueue = useCallback(async (branchId: BranchId, token: number) => {
    const entry = (queue[branchId] ?? []).find((e) => e.token === token);
    if (entry?.appointmentId) {
      await appointmentService.update(entry.appointmentId, { status: "cancelled", token: null });
    }
  }, [queue]);

  const convertToStaff = useCallback<DataContextValue["convertToStaff"]>(
    async (userId, data) => {
      const target = users.find((u) => u.id === userId);
      if (!target) return { ok: false, error: "User not found." };
      if (target.role === "staff") return { ok: false, error: "This user is already staff." };
      if (users.some((u) => u.role === "staff" && u.phone === target.phone))
        return { ok: false, error: "A staff account with this phone already exists." };
      await userService.convertToStaff(userId, data);
      await notificationService.create({
        recipientId: userId,
        title: "You are now Staff",
        message: `You have been activated as ${data.position} at ${branchLabel(data.branch)}.`,
        kind: "system",
      });
      return { ok: true };
    },
    [users]
  );

  const toggleStaffActive = useCallback(async (userId: string) => {
    await userService.toggleStaffActive(userId);
  }, []);

  const addService = useCallback(async (s: Omit<Service, "id">) => {
    await serviceService.add(s);
  }, []);

  const updateService = useCallback(async (id: string, patch: Partial<Service>) => {
    await serviceService.update(id, patch);
  }, []);

  const deleteService = useCallback(async (id: string) => {
    await serviceService.remove(id);
  }, []);

  const toggleService = useCallback(
    async (id: string) => {
      const s = services.find((x) => x.id === id);
      if (s) await serviceService.update(id, { active: !s.active });
    },
    [services]
  );

  const addOffer = useCallback(async (o: Omit<Offer, "id">) => {
    await offerService.add(o);
  }, []);

  const updateOffer = useCallback(async (id: string, patch: Partial<Offer>) => {
    await offerService.update(id, patch);
  }, []);

  const deleteOffer = useCallback(async (id: string) => {
    await offerService.remove(id);
  }, []);

  const toggleOffer = useCallback(
    async (id: string) => {
      const o = offers.find((x) => x.id === id);
      if (o) await offerService.update(id, { active: !o.active });
    },
    [offers]
  );

  const notify = useCallback(
    async (input: Partial<AppNotification> & { title: string; message: string; kind: AppNotification["kind"] }) => {
      await notificationService.create(input);
    },
    []
  );

  const markNotificationRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (currentUser) await notificationService.markAllRead(currentUser.id);
  }, [currentUser]);

  const notificationsFor = useCallback(
    (user: User) =>
      notifications.filter((n) => {
        if (n.recipientId) return n.recipientId === user.id;
        if (n.audience) return n.audience === user.role;
        if (n.branchId) return n.branchId === (user.role === "customer" ? user.preferredBranch : (user.staffBranch ?? user.ownerBranch));
        return false;
      }),
    [notifications]
  );

  const unreadCount = useCallback(
    (user: User) => notificationsFor(user).filter((n) => !n.read).length,
    [notificationsFor]
  );

  const getBranch = useCallback(
    (id: BranchId) => branches.find((b) => b.id === id) ?? branches[0] ?? DEFAULT_BRANCHES[0],
    [branches]
  );

  const getServicesFor = useCallback(
    (branchId: BranchId) => services.filter((s) => s.branchId === branchId && s.active),
    [services]
  );

  const getOffersFor = useCallback(
    (branchId: BranchId) => offers.filter((o) => o.branchId === branchId || o.branchId === "all"),
    [offers]
  );

  const getAppointmentsForBranch = useCallback(
    (branchId: BranchId) => appointments.filter((a) => a.branchId === branchId),
    [appointments]
  );

  const getShopStatus = useCallback(
    (branchId: BranchId): ShopStatus => {
      const branch = branches.find((b) => b.id === branchId) ?? DEFAULT_BRANCHES.find((b) => b.id === branchId) ?? DEFAULT_BRANCHES[0];
      const q = queue[branchId] ?? [];
      const inServiceCount = appointments.filter(
        (a) => a.branchId === branchId && a.status === "in_service" && a.date === todayISO()
      ).length;
      return {
        isOpen: branch.isOpen,
        nowServingToken: serving[branchId] ?? null,
        waitingCount: q.length,
        inServiceCount,
        estimatedWaitMin: q.length * AVG_SERVICE_MIN,
        availableChairs: Math.max(0, branch.availableChairs - inServiceCount),
        totalChairs: branch.totalChairs,
      };
    },
    [branches, queue, appointments, serving]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      users,
      branches,
      services,
      offers,
      appointments,
      queue,
      notifications,
      serving,
      currentUser,
      activeBranchId,
      login,
      register,
      logout,
      updatePassword,
      setActiveBranch,
      bookAppointment,
      confirmAppointment,
      rejectAppointment,
      checkInAppointment,
      startService,
      completeAppointment,
      markNoShow,
      cancelAppointment,
      joinWalkIn,
      callNext,
      leaveQueue,
      convertToStaff,
      toggleStaffActive,
      addService,
      updateService,
      deleteService,
      toggleService,
      addOffer,
      updateOffer,
      deleteOffer,
      toggleOffer,
      notify,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsFor,
      unreadCount,
      getBranch,
      getServicesFor,
      getOffersFor,
      getAppointmentsForBranch,
      getShopStatus,
    }),
    [
      ready, users, branches, services, offers, appointments, queue, notifications, serving,
      currentUser, activeBranchId, login, register, logout, updatePassword, setActiveBranch,
      bookAppointment, confirmAppointment, rejectAppointment, checkInAppointment, startService,
      completeAppointment, markNoShow, cancelAppointment, joinWalkIn, callNext, leaveQueue,
      convertToStaff, toggleStaffActive, addService, updateService, deleteService, toggleService,
      addOffer, updateOffer, deleteOffer, toggleOffer, notify, markNotificationRead,
      markAllNotificationsRead, notificationsFor, unreadCount, getBranch, getServicesFor,
      getOffersFor, getAppointmentsForBranch, getShopStatus,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function branchLabel(b: BranchId) {
  return b === "lhasurane" ? "Lhasurane" : "Koregaon";
}

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("auth/user-not-found") || code.includes("auth/wrong-password") || code.includes("auth/invalid-credential"))
    return "Invalid email or password.";
  if (code.includes("auth/email-already-in-use")) return "An account with this email already exists.";
  if (code.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("auth/network-request-failed")) return "Network error. Check your connection.";
  if (code.includes("auth/requires-recent-login")) return "Please log in again to change your password.";
  return "Something went wrong. Please try again.";
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useCurrentUser(): User | null {
  return useData().currentUser;
}

export { STATUS_LABELS };
