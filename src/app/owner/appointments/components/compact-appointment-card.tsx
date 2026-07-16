"use client";

import { useMemo } from "react";
import { type Appointment, type Service } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { AppointmentActionMenu } from "./appointment-action-menu";
import { cn } from "@/lib/utils";

interface CompactAppointmentCardProps {
  appointment: Appointment;
  services: Service[];
  isSelected?: boolean;
  onClick?: () => void;
  onViewHistory?: () => void;
}

export function CompactAppointmentCard({
  appointment,
  services,
  isSelected,
  onClick,
  onViewHistory,
}: CompactAppointmentCardProps) {
  // Get matching services
  const matchedServices = useMemo(() => {
    return appointment.serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter(Boolean) as Service[];
  }, [appointment.serviceIds, services]);

  const serviceNames = matchedServices.map((s) => s.name).join(", ");
  const totalPrice = matchedServices.reduce((sum, s) => sum + s.price, 0);

  const initials = appointment.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm transition-all hover:border-primary/50 cursor-pointer",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
      )}
    >
      <Avatar className="h-12 w-12 border border-border bg-muted">
        <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-medium leading-none">{appointment.customerName}</h3>
          <span className="text-sm font-semibold shrink-0">{appointment.time}</span>
        </div>
        
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">{serviceNames || "Standard Service"}</p>
          <span className="text-sm font-medium text-muted-foreground shrink-0">₹{totalPrice}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <StatusChip status={appointment.status} />
          
          <div onClick={(e) => e.stopPropagation()}>
            <AppointmentActionMenu 
              appointment={appointment} 
              onViewDetails={onClick}
              onViewHistory={onViewHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
