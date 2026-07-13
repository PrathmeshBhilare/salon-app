"use client";

import { CalendarDays, Clock, Scissors, Ticket, Phone, Mail, CalendarPlus, CheckCircle2 } from "lucide-react";
import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit";
import { BRANCH_LABELS } from "@/lib/types";
import { formatDate, formatPrice, formatTime, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AppointmentCard({
  appointment,
  action,
}: {
  appointment: import("@/lib/types").Appointment;
  action?: React.ReactNode;
}) {
  const { getBranch, getServicesFor, users } = useData();
  const branch = getBranch(appointment.branchId);
  const svcs = getServicesFor(appointment.branchId);
  const names = appointment.serviceIds
    .map((id) => svcs.find((s) => s.id === id)?.name ?? "Service")
    .join(", ");
  const total = appointment.serviceIds
    .map((id) => svcs.find((s) => s.id === id)?.price ?? 0)
    .reduce((a, b) => a + b, 0);

  const customerUser = users.find((u) => u.uid === appointment.customerUid || u.id === appointment.customerId);
  const customerEmail = customerUser?.email;
  const isActive = ["pending", "confirmed", "checked_in", "in_service"].includes(appointment.status);
  const isFailed = ["cancelled", "rejected", "no_show"].includes(appointment.status);

  return (
    <Card className={cn("space-y-4 p-4 shadow-sm", isFailed && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{appointment.customerName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {appointment.customerPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {appointment.customerPhone}
              </span>
            )}
            {customerEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {customerEmail}
              </span>
            )}
            <span className="flex items-center gap-1 font-mono">
               #{appointment.reference}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </div>
          )}
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      <div className="rounded-md bg-muted/40 p-3 space-y-2">
        <p className="text-sm font-medium leading-tight">{names}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(appointment.date)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {formatTime(appointment.time)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Scissors className="h-3.5 w-3.5" /> {BRANCH_LABELS[appointment.branchId]}
          </span>
          {appointment.token && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Ticket className="h-3.5 w-3.5" /> Token #{appointment.token}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {total > 0 ? (
          <p>
            <span className="text-muted-foreground">Estimated total: </span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </p>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Booked exact time">
          <CalendarPlus className="h-3.5 w-3.5" /> Booked: {appointment.createdAt ? formatDateTime(appointment.createdAt) : "Unknown"}
        </span>
      </div>

      {action && <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">{action}</div>}
    </Card>
  );
}
