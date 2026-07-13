"use client";

import { Check, Phone, Play, UserCheck, UserX, X } from "lucide-react";
import { useData } from "@/lib/store";
import { AppointmentCard } from "@/components/appointment-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Appointment, Role } from "@/lib/types";

export function AppointmentActionCard({
  appointment,
  role,
}: {
  appointment: Appointment;
  role: Role;
}) {
  const { confirmAppointment, checkInAppointment, startService, completeAppointment, markNoShow, rejectAppointment, cancelAppointment } =
    useData();

  const act = (fn: () => Promise<void>, msg: string) => () => {
    fn()
      .then(() => toast.success(msg))
      .catch((err: any) => {
        console.error("Action Error:", err);
        toast.error(err?.message || "Action failed. Please try again.");
      });
  };

  const actions = (() => {
    switch (appointment.status) {
      case "pending":
        return (
          <>
            <Button size="sm" className="gap-1" onClick={act(() => confirmAppointment(appointment.id), "Confirmed")}>
              <Check className="h-4 w-4" /> Confirm
            </Button>
            {(role === "owner" || role === "staff") && (
              <Button size="sm" variant="ghost" className="text-rose-500" onClick={act(() => rejectAppointment(appointment.id), "Rejected")}>
                <X className="h-4 w-4" /> Reject
              </Button>
            )}
          </>
        );
      case "confirmed":
        return (
          <>
            <Button size="sm" className="gap-1" onClick={act(() => checkInAppointment(appointment.id), "Checked in")}>
              <UserCheck className="h-4 w-4" /> Check In
            </Button>
            <Button size="sm" variant="ghost" className="text-rose-500" onClick={act(() => markNoShow(appointment.id), "No show")}>
              <UserX className="h-4 w-4" /> No Show
            </Button>
          </>
        );
      case "checked_in":
        return (
          <Button size="sm" className="gap-1" onClick={act(() => startService(appointment.id), "Started")}>
            <Play className="h-4 w-4" /> Start Service
          </Button>
        );
      case "in_service":
        return (
          <Button size="sm" className="gap-1" onClick={act(() => completeAppointment(appointment.id), "Completed")}>
            <Check className="h-4 w-4" /> Complete
          </Button>
        );
      default:
        return null;
    }
  })();

  const ownerCancel =
    role === "owner" && !["completed", "cancelled", "rejected", "no_show"].includes(appointment.status) ? (
      <Button size="sm" variant="ghost" className="text-rose-600" onClick={act(() => cancelAppointment(appointment.id), "Cancelled")}>
        <X className="h-4 w-4" /> Cancel
      </Button>
    ) : null;

  return (
    <AppointmentCard
      appointment={appointment}
        action={
          actions || ownerCancel ? (
            <div className="flex w-full flex-wrap items-center gap-2">
              {actions}
              {ownerCancel}
              <a href={`tel:${appointment.customerPhone}`} className="ml-auto">
                <Button size="sm" variant="outline" className="gap-1">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No actions</span>
          )
        }
    />
  );
}
