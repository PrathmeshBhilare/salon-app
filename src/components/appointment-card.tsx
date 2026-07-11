"use client";

import { CalendarDays, Clock, Scissors, Ticket } from "lucide-react";
import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit";
import { BRANCH_LABELS } from "@/lib/types";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AppointmentCard({
  appointment,
  action,
}: {
  appointment: import("@/lib/types").Appointment;
  action?: React.ReactNode;
}) {
  const { getBranch, getServicesFor } = useData();
  const branch = getBranch(appointment.branchId);
  const svcs = getServicesFor(appointment.branchId);
  const names = appointment.serviceIds
    .map((id) => svcs.find((s) => s.id === id)?.name ?? "Service")
    .join(", ");
  const total = appointment.serviceIds
    .map((id) => svcs.find((s) => s.id === id)?.price ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <Card className="space-y-3 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{names}</p>
          </div>
          <p className="text-xs text-muted-foreground">{appointment.reference}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-4 w-4" /> {formatDate(appointment.date)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" /> {formatTime(appointment.time)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Scissors className="h-4 w-4" /> {BRANCH_LABELS[appointment.branchId]}
        </span>
        {appointment.token && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Ticket className="h-4 w-4" /> Token #{appointment.token}
          </span>
        )}
      </div>

      {total > 0 && (
        <p className="text-sm">
          <span className="text-muted-foreground">Estimated total: </span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </p>
      )}

      {action && <div className="flex items-center gap-2 pt-1">{action}</div>}
    </Card>
  );
}
