import type { Role } from "@/lib/types";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  Scissors,
  Settings,
  Tag,
  UserCog,
  UserRound,
  Users,
  Home,
  Code,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: "notifications";
}

export const NAV: Record<Role, NavItem[]> = {
  customer: [
    { label: "Home", href: "/customer", icon: Home },
    { label: "Book", href: "/customer/book", icon: CalendarPlus },
    { label: "Offers", href: "/customer/offers", icon: Tag },
    { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
    { label: "Notifications", href: "/customer/notifications", icon: Bell, badge: "notifications" },
    { label: "Settings", href: "/customer/settings", icon: Settings },
    { label: "Profile", href: "/customer/profile", icon: UserRound },
    { label: "Crafted By", href: "/customer/developer", icon: Code },
  ],
  staff: [
    { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { label: "My Appointments", href: "/staff/appointments", icon: CalendarCheck },
    { label: "Schedule", href: "/staff/schedule", icon: CalendarDays },
    { label: "Notifications", href: "/staff/notifications", icon: Bell, badge: "notifications" },
    { label: "Settings", href: "/staff/settings", icon: Settings },
    { label: "Profile", href: "/staff/profile", icon: UserRound },
    { label: "Crafted By", href: "/staff/developer", icon: Code },
  ],
  owner: [
    { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { label: "Appointments", href: "/owner/appointments", icon: CalendarCheck },
    { label: "Customers", href: "/owner/customers", icon: Users },
    { label: "Staff", href: "/owner/staff", icon: UserCog },
    { label: "Services", href: "/owner/services", icon: Scissors },
    { label: "Offers", href: "/owner/offers", icon: Tag },
    { label: "Notifications", href: "/owner/notifications", icon: Bell, badge: "notifications" },
    { label: "Settings", href: "/owner/settings", icon: Settings },
    { label: "Profile", href: "/owner/profile", icon: UserRound },
    { label: "Crafted By", href: "/owner/developer", icon: Code },
  ],
};

export const ROLE_TAGLINE: Record<Role, string> = {
  customer: "Your salon, beautifully booked",
  staff: "Run the floor with confidence",
  owner: "Manage every branch, effortlessly",
};
