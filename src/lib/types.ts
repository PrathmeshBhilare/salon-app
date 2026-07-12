export type Role = "customer" | "staff" | "owner";

export type BranchId = "lhasurane" | "koregaon";

export interface Branch {
  id: BranchId;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  availableChairs: number;
  totalChairs: number;
  workingHours: WorkingHour[];
  nextToken: number;
  nowServing: number | null;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface User {
  id: string;
  uid: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  preferredBranch: BranchId;
  role: Role;
  avatarColor: string;
  photoURL?: string;
  fcmToken?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  // staff extras
  staffBranch?: BranchId;
  staffPosition?: string;
  staffServices?: string[];
  active?: boolean;
  // owner extras
  ownerBranch?: BranchId;
}

export interface Service {
  id: string;
  branchId: BranchId;
  category: string;
  name: string;
  price: number;
  durationMin: number;
  active: boolean;
}

export interface Offer {
  id: string;
  branchId: BranchId | "all";
  title: string;
  description: string;
  badge: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_service"
  | "completed"
  | "cancelled"
  | "rejected"
  | "no_show";

export interface Appointment {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: BranchId;
  serviceIds: string[];
  date: string;
  time: string;
  status: AppointmentStatus;
  isWalkIn: boolean;
  token: number | null;
  createdAt: string;
  notes?: string;
  assignedStaffId?: string;
  customerUid?: string;
  queuedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface QueueEntry {
  token: number;
  appointmentId: string | null;
  customerName: string;
  branchId: BranchId;
  isWalkIn: boolean;
  joinedAt: string;
}

export interface AppNotification {
  id: string;
  recipientId?: string;
  recipientUid?: string;
  audience?: Role;
  branchId?: BranchId;
  title: string;
  message: string;
  kind: "booking" | "cancel" | "reminder" | "announcement" | "system" | "queue";
  read: boolean;
  createdAt: string;
}

export interface ShopStatus {
  isOpen: boolean;
  nowServingToken: number | null;
  waitingCount: number;
  inServiceCount: number;
  estimatedWaitMin: number;
  availableChairs: number;
  totalChairs: number;
}

export const BRANCHES: BranchId[] = ["lhasurane", "koregaon"];

export const BRANCH_LABELS: Record<BranchId, string> = {
  lhasurane: "Lhasurane",
  koregaon: "Koregaon",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  in_service: "In Service",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  no_show: "No Show",
};

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  staff: "Staff",
  owner: "Owner",
};
