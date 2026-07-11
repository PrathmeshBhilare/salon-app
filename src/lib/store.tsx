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
import {
  BRANCHES,
  STATUS_LABELS,
} from "./types";
import {
  addDaysISO,
  generateId,
  generateReference,
  generateUserId,
  todayISO,
} from "./format";
import {
  seedAppointments,
  seedBranches,
  seedNotifications,
  seedOffers,
  seedQueue,
  seedServices,
  seedUsers,
} from "./seed";

const STORAGE_KEY = "gg_studio_state_v1";
const SESSION_KEY = "gg_studio_session_v1";
const AVG_SERVICE_MIN = 30;

interface PersistShape {
  users: User[];
  branches: Branch[];
  services: Service[];
  offers: Offer[];
  appointments: Appointment[];
  queue: Record<string, QueueEntry[]>;
  notifications: AppNotification[];
  serving: Record<string, number | null>;
  tokenSeq: Record<string, number>;
}

interface BookInput {
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: BranchId;
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string;
}

type NotifyInput = Partial<AppNotification> & {
  title: string;
  message: string;
  kind: AppNotification["kind"];
};

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
  // auth
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  register: (input: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    preferredBranch: BranchId;
  }) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  updatePassword: (current: string, next: string) => { ok: boolean; error?: string };
  // branch
  setActiveBranch: (id: BranchId) => void;
  // appointments
  bookAppointment: (input: BookInput) => Appointment;
  confirmAppointment: (id: string) => void;
  rejectAppointment: (id: string) => void;
  checkInAppointment: (id: string) => void;
  startService: (id: string, staffId?: string) => void;
  completeAppointment: (id: string) => void;
  markNoShow: (id: string) => void;
  cancelAppointment: (id: string) => void;
  // queue
  joinWalkIn: (branchId: BranchId, customerName: string, serviceIds: string[]) => QueueEntry;
  callNext: (branchId: BranchId) => void;
  leaveQueue: (branchId: BranchId, token: number) => void;
  // staff
  convertToStaff: (
    userId: string,
    data: { branch: BranchId; position: string; services: string[] }
  ) => { ok: boolean; error?: string };
  toggleStaffActive: (userId: string) => void;
  // services
  addService: (s: Omit<Service, "id">) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleService: (id: string) => void;
  // offers
  addOffer: (o: Omit<Offer, "id">) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  toggleOffer: (id: string) => void;
  // notifications
  notify: (input: NotifyInput) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationsFor: (user: User) => AppNotification[];
  unreadCount: (user: User) => number;
  // derived
  getBranch: (id: BranchId) => Branch;
  getServicesFor: (branchId: BranchId) => Service[];
  getOffersFor: (branchId: BranchId) => Offer[];
  getAppointmentsForBranch: (branchId: BranchId) => Appointment[];
  getShopStatus: (branchId: BranchId) => ShopStatus;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function seedState(): PersistShape {
  return {
    users: seedUsers,
    branches: seedBranches,
    services: seedServices,
    offers: seedOffers,
    appointments: seedAppointments,
    queue: seedQueue,
    notifications: seedNotifications,
    serving: { lhasurane: null, koregaon: null },
    tokenSeq: { lhasurane: 3, koregaon: 2 },
  };
}

function loadState(): PersistShape {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as PersistShape;
    if (!parsed.users) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistShape>(seedState);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<BranchId>("lhasurane");
  const [ready, setReady] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const sessionRaw = window.localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      try {
        const id = JSON.parse(sessionRaw) as string;
        const u = loaded.users.find((x) => x.id === id);
        if (u) {
          setCurrentUser(u);
          setActiveBranchId(u.role === "customer" ? u.preferredBranch : (u.staffBranch ?? u.ownerBranch ?? "lhasurane"));
        }
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 150);
  }, [state, ready]);

  const persist = useCallback((next: PersistShape) => {
    setState(next);
  }, []);

  const update = useCallback(
    (mut: (s: PersistShape) => PersistShape) => {
      setState((prev) => mut(prev));
    },
    []
  );

  const notify = useCallback(
    (input: NotifyInput) => {
      const n: AppNotification = {
        id: generateId("ntf"),
        read: false,
        createdAt: new Date().toISOString(),
        recipientId: input.recipientId,
        audience: input.audience,
        branchId: input.branchId,
        title: input.title,
        message: input.message,
        kind: input.kind,
      };
      update((s) => ({ ...s, notifications: [n, ...s.notifications].slice(0, 200) }));
    },
    [update]
  );

  const login = useCallback<DataContextValue["login"]>((identifier, password) => {
    const id = identifier.trim().toLowerCase();
    const u = state.users.find(
      (x) =>
        x.email.toLowerCase() === id ||
        x.phone.replace(/\s/g, "") === identifier.replace(/\s/g, "") ||
        x.id.toLowerCase() === id
    );
    if (!u) return { ok: false, error: "Account not found." };
    if (u.password !== password) return { ok: false, error: "Incorrect password." };
    setCurrentUser(u);
    setActiveBranchId(u.role === "customer" ? u.preferredBranch : (u.staffBranch ?? u.ownerBranch ?? "lhasurane"));
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(u.id));
    return { ok: true };
  }, [state.users]);

  const register = useCallback<DataContextValue["register"]>((input) => {
    const email = input.email.trim().toLowerCase();
    if (state.users.some((x) => x.email.toLowerCase() === email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const user: User = {
      id: generateUserId(),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email,
      password: input.password,
      preferredBranch: input.preferredBranch,
      role: "customer",
      avatarColor: "#b08d57",
      createdAt: new Date().toISOString(),
      active: true,
    };
    update((s) => ({ ...s, users: [...s.users, user] }));
    setCurrentUser(user);
    setActiveBranchId(user.preferredBranch);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user.id));
    notify({
      title: "Welcome to Glow & Glamour",
      message: "Your account is ready. Book your first appointment!",
      kind: "system",
      recipientId: user.id,
    });
    return { ok: true, user };
  }, [state.users, update, notify]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const updatePassword = useCallback<DataContextValue["updatePassword"]>((current, next) => {
    if (!currentUser) return { ok: false, error: "Not signed in." };
    if (currentUser.password !== current) return { ok: false, error: "Current password is wrong." };
    const updated = { ...currentUser, password: next };
    update((s) => ({ ...s, users: s.users.map((u) => (u.id === updated.id ? updated : u)) }));
    setCurrentUser(updated);
    return { ok: true };
  }, [currentUser, update]);

  const setActiveBranch = useCallback((id: BranchId) => setActiveBranchId(id), []);

  const bookAppointment = useCallback<DataContextValue["bookAppointment"]>((input) => {
    const appt: Appointment = {
      id: generateId("appt"),
      reference: generateReference(),
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      branchId: input.branchId,
      serviceIds: input.serviceIds,
      date: input.date,
      time: input.time,
      status: "pending",
      isWalkIn: false,
      token: null,
      createdAt: new Date().toISOString(),
      notes: input.notes,
    };
    update((s) => ({ ...s, appointments: [appt, ...s.appointments] }));
    notify({
      title: "Booking Received",
      message: `Your appointment at ${input.branchId === "lhasurane" ? "Lhasurane" : "Koregaon"} is pending confirmation.`,
      kind: "booking",
      recipientId: input.customerId,
    });
    notify({
      title: "New Booking",
      message: `${input.customerName} booked for ${input.date} at ${input.time}.`,
      kind: "booking",
      audience: "staff",
      branchId: input.branchId,
    });
    notify({
      title: "New Booking",
      message: `${input.customerName} booked at ${input.branchId === "lhasurane" ? "Lhasurane" : "Koregaon"}.`,
      kind: "booking",
      audience: "owner",
    });
    return appt;
  }, [update, notify]);

  const confirmAppointment = useCallback<DataContextValue["confirmAppointment"]>((id) => {
    update((s) => ({
      ...s,
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: "confirmed" } : a
      ),
    }));
    const a = state.appointments.find((x) => x.id === id);
    if (a) {
      notify({
        title: "Booking Confirmed",
        message: `Your appointment on ${a.date} at ${a.time} is confirmed.`,
        kind: "booking",
        recipientId: a.customerId,
      });
    }
  }, [update, state.appointments, notify]);

  const rejectAppointment = useCallback<DataContextValue["rejectAppointment"]>((id) => {
    update((s) => ({
      ...s,
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: "rejected" } : a
      ),
    }));
    const a = state.appointments.find((x) => x.id === id);
    if (a) {
      notify({
        title: "Booking Rejected",
        message: `Sorry, your appointment on ${a.date} could not be accommodated.`,
        kind: "cancel",
        recipientId: a.customerId,
      });
    }
  }, [update, state.appointments, notify]);

  const checkInAppointment = useCallback<DataContextValue["checkInAppointment"]>((id) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (!a || a.status === "checked_in" || a.status === "in_service" || a.status === "completed") {
        return s;
      }
      const nextToken = (s.tokenSeq[a.branchId] ?? 0) + 1;
      const entry: QueueEntry = {
        token: nextToken,
        appointmentId: a.id,
        customerName: a.customerName,
        branchId: a.branchId,
        isWalkIn: a.isWalkIn,
        joinedAt: new Date().toISOString(),
      };
      return {
        ...s,
        tokenSeq: { ...s.tokenSeq, [a.branchId]: nextToken },
        appointments: s.appointments.map((x) =>
          x.id === id ? { ...x, status: "checked_in", token: nextToken } : x
        ),
        queue: { ...s.queue, [a.branchId]: [...(s.queue[a.branchId] ?? []), entry] },
      };
    });
  }, [update]);

  const startService = useCallback<DataContextValue["startService"]>((id, staffId) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (!a) return s;
      const serving = a.token;
      return {
        ...s,
        serving: { ...s.serving, [a.branchId]: serving },
        appointments: s.appointments.map((x) =>
          x.id === id ? { ...x, status: "in_service", assignedStaffId: staffId ?? x.assignedStaffId } : x
        ),
        queue: { ...s.queue, [a.branchId]: (s.queue[a.branchId] ?? []).filter((q) => q.appointmentId !== id) },
      };
    });
  }, [update]);

  const completeAppointment = useCallback<DataContextValue["completeAppointment"]>((id) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (!a) return s;
      return {
        ...s,
        serving: { ...s.serving, [a.branchId]: null },
        appointments: s.appointments.map((x) =>
          x.id === id ? { ...x, status: "completed", token: null } : x
        ),
      };
    });
  }, [update]);

  const markNoShow = useCallback<DataContextValue["markNoShow"]>((id) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (!a) return s;
      return {
        ...s,
        appointments: s.appointments.map((x) =>
          x.id === id ? { ...x, status: "no_show", token: null } : x
        ),
        queue: { ...s.queue, [a.branchId]: (s.queue[a.branchId] ?? []).filter((q) => q.appointmentId !== id) },
      };
    });
  }, [update]);

  const cancelAppointment = useCallback<DataContextValue["cancelAppointment"]>((id) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (!a) return s;
      return {
        ...s,
        appointments: s.appointments.map((x) =>
          x.id === id ? { ...x, status: "cancelled", token: null } : x
        ),
        queue: { ...s.queue, [a.branchId]: (s.queue[a.branchId] ?? []).filter((q) => q.appointmentId !== id) },
      };
    });
    const a = state.appointments.find((x) => x.id === id);
    if (a) {
      notify({
        title: "Booking Cancelled",
        message: `Your appointment on ${a.date} has been cancelled by the salon.`,
        kind: "cancel",
        recipientId: a.customerId,
      });
    }
  }, [update, state.appointments, notify]);

  const joinWalkIn = useCallback<DataContextValue["joinWalkIn"]>((branchId, customerName, serviceIds) => {
    const appt: Appointment = {
      id: generateId("appt"),
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
      token: null,
      createdAt: new Date().toISOString(),
    };
    let entry: QueueEntry | null = null;
    update((s) => {
      const nextToken = (s.tokenSeq[branchId] ?? 0) + 1;
      entry = {
        token: nextToken,
        appointmentId: appt.id,
        customerName,
        branchId,
        isWalkIn: true,
        joinedAt: new Date().toISOString(),
      };
      return {
        ...s,
        tokenSeq: { ...s.tokenSeq, [branchId]: nextToken },
        appointments: [appt, ...s.appointments],
        queue: { ...s.queue, [branchId]: [...(s.queue[branchId] ?? []), entry!] },
      };
    });
    notify({
      title: "Walk-in Joined",
      message: `${customerName} joined the queue at ${branchId === "lhasurane" ? "Lhasurane" : "Koregaon"}.`,
      kind: "queue",
      audience: "staff",
      branchId,
    });
    return entry!;
  }, [update, notify]);

  const callNext = useCallback<DataContextValue["callNext"]>((branchId) => {
    update((s) => {
      const q = s.queue[branchId] ?? [];
      if (q.length === 0) return s;
      const next = q[0];
      return {
        ...s,
        serving: { ...s.serving, [branchId]: next.token },
        appointments: s.appointments.map((x) =>
          x.id === next.appointmentId ? { ...x, status: "in_service" } : x
        ),
        queue: { ...s.queue, [branchId]: q.slice(1) },
      };
    });
  }, [update]);

  const leaveQueue = useCallback<DataContextValue["leaveQueue"]>((branchId, token) => {
    update((s) => ({
      ...s,
      queue: { ...s.queue, [branchId]: (s.queue[branchId] ?? []).filter((q) => q.token !== token) },
    }));
  }, [update]);

  const convertToStaff = useCallback<DataContextValue["convertToStaff"]>((userId, data) => {
    const target = state.users.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "User not found." };
    if (target.role === "staff") return { ok: false, error: "This user is already staff." };
    if (state.users.some((u) => u.role === "staff" && u.phone === target.phone)) {
      return { ok: false, error: "A staff account with this phone already exists." };
    }
    const updated: User = {
      ...target,
      role: "staff",
      staffBranch: data.branch,
      staffPosition: data.position,
      staffServices: data.services,
      active: true,
    };
    update((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? updated : u)) }));
    if (currentUser?.id === userId) setCurrentUser(updated);
    notify({
      title: "You are now Staff",
      message: `You have been activated as ${data.position} at ${data.branch === "lhasurane" ? "Lhasurane" : "Koregaon"}.`,
      kind: "system",
      recipientId: userId,
    });
    return { ok: true };
  }, [state.users, update, currentUser, notify]);

  const toggleStaffActive = useCallback<DataContextValue["toggleStaffActive"]>((userId) => {
    update((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === userId && u.role === "staff" ? { ...u, active: !u.active } : u
      ),
    }));
  }, [update]);

  const addService = useCallback<DataContextValue["addService"]>((svc) => {
    update((s) => ({ ...s, services: [...s.services, { ...svc, id: generateId("svc") }] }));
  }, [update]);

  const updateService = useCallback<DataContextValue["updateService"]>((id, patch) => {
    update((s) => ({ ...s, services: s.services.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [update]);

  const deleteService = useCallback<DataContextValue["deleteService"]>((id) => {
    update((s) => ({ ...s, services: s.services.filter((x) => x.id !== id) }));
  }, [update]);

  const toggleService = useCallback<DataContextValue["toggleService"]>((id) => {
    update((s) => ({ ...s, services: s.services.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) }));
  }, [update]);

  const addOffer = useCallback<DataContextValue["addOffer"]>((o) => {
    update((s) => ({ ...s, offers: [{ ...o, id: generateId("off") }, ...s.offers] }));
  }, [update]);

  const updateOffer = useCallback<DataContextValue["updateOffer"]>((id, patch) => {
    update((s) => ({ ...s, offers: s.offers.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [update]);

  const deleteOffer = useCallback<DataContextValue["deleteOffer"]>((id) => {
    update((s) => ({ ...s, offers: s.offers.filter((x) => x.id !== id) }));
  }, [update]);

  const toggleOffer = useCallback<DataContextValue["toggleOffer"]>((id) => {
    update((s) => ({ ...s, offers: s.offers.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) }));
  }, [update]);

  const markNotificationRead = useCallback<DataContextValue["markNotificationRead"]>((id) => {
    update((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }, [update]);

  const markAllNotificationsRead = useCallback(() => {
    update((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, [update]);

  const notificationsFor = useCallback<DataContextValue["notificationsFor"]>((user) => {
    return state.notifications.filter((n) => {
      if (n.recipientId) return n.recipientId === user.id;
      if (n.audience) return n.audience === user.role;
      if (n.branchId) return n.branchId === (user.role === "customer" ? user.preferredBranch : (user.staffBranch ?? user.ownerBranch));
      return false;
    });
  }, [state.notifications]);

  const unreadCount = useCallback<DataContextValue["unreadCount"]>((user) => {
    return notificationsFor(user).filter((n) => !n.read).length;
  }, [notificationsFor]);

  const getBranch = useCallback<DataContextValue["getBranch"]>((id) => {
    return state.branches.find((b) => b.id === id) ?? state.branches[0];
  }, [state.branches]);

  const getServicesFor = useCallback<DataContextValue["getServicesFor"]>((branchId) => {
    return state.services.filter((s) => s.branchId === branchId && s.active);
  }, [state.services]);

  const getOffersFor = useCallback<DataContextValue["getOffersFor"]>((branchId) => {
    return state.offers.filter((o) => o.branchId === branchId || o.branchId === "all");
  }, [state.offers]);

  const getAppointmentsForBranch = useCallback<DataContextValue["getAppointmentsForBranch"]>((branchId) => {
    return state.appointments.filter((a) => a.branchId === branchId);
  }, [state.appointments]);

  const getShopStatus = useCallback<DataContextValue["getShopStatus"]>((branchId) => {
    const branch = state.branches.find((b) => b.id === branchId)!;
    const q = state.queue[branchId] ?? [];
    const inServiceCount = state.appointments.filter(
      (a) => a.branchId === branchId && a.status === "in_service" && a.date === todayISO()
    ).length;
    const waitingCount = q.length;
    const estimatedWaitMin = waitingCount * AVG_SERVICE_MIN;
    return {
      isOpen: branch.isOpen,
      nowServingToken: state.serving[branchId] ?? null,
      waitingCount,
      inServiceCount,
      estimatedWaitMin,
      availableChairs: Math.max(0, branch.totalChairs - branch.totalChairs + branch.availableChairs - inServiceCount),
      totalChairs: branch.totalChairs,
    };
  }, [state.branches, state.queue, state.appointments, state.serving]);

  const resetDemo = useCallback(() => {
    const fresh = seedState();
    persist(fresh);
    window.localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setActiveBranchId("lhasurane");
  }, [persist]);

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      users: state.users,
      branches: state.branches,
      services: state.services,
      offers: state.offers,
      appointments: state.appointments,
      queue: state.queue,
      notifications: state.notifications,
      serving: state.serving,
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
      resetDemo,
    }),
    [
      ready, state, currentUser, activeBranchId, login, register, logout, updatePassword,
      setActiveBranch, bookAppointment, confirmAppointment, rejectAppointment, checkInAppointment,
      startService, completeAppointment, markNoShow, cancelAppointment, joinWalkIn, callNext,
      leaveQueue, convertToStaff, addService, updateService, deleteService, toggleService,
      addOffer, updateOffer, deleteOffer, toggleOffer, notify, markNotificationRead,
      markAllNotificationsRead, notificationsFor, unreadCount, getBranch, getServicesFor,
      getOffersFor, getAppointmentsForBranch, getShopStatus, resetDemo,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
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
