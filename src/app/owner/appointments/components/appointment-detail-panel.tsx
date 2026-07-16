"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { type Appointment, type Service, BRANCH_LABELS } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusChip } from "@/components/ui/status-chip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, User as UserIcon, FileText, CheckCircle2 } from "lucide-react";
import { AppointmentActionMenu } from "./appointment-action-menu";

interface AppointmentDetailPanelProps {
  appointment: Appointment;
  services: Service[];
  allAppointments: Appointment[];
  onClose?: () => void;
}

export function AppointmentDetailPanel({
  appointment,
  services,
  allAppointments,
  onClose
}: AppointmentDetailPanelProps) {
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

  // Customer History
  const history = useMemo(() => {
    if (!appointment.customerUid && appointment.customerId === "walkin") return [];
    
    return allAppointments
      .filter(a => 
        (a.customerUid === appointment.customerUid || a.customerId === appointment.customerId) 
        && a.status === "completed"
      )
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [allAppointments, appointment.customerUid, appointment.customerId]);

  const lifetimeSpending = history.reduce((sum, a) => {
    const sPrice = a.serviceIds.reduce((sSum, sId) => {
      const s = services.find((x) => x.id === sId);
      return sSum + (s?.price || 0);
    }, 0);
    return sum + sPrice;
  }, 0);

  // Timeline events
  const timeline = [
    { label: "Booked", time: appointment.createdAt },
    { label: "Confirmed", time: appointment.confirmedAt },
    { label: "Checked In", time: appointment.queuedAt },
    { label: "Service Started", time: appointment.serviceStartedAt },
    { label: "Completed", time: appointment.completedAt },
  ].filter(t => !!t.time).sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="flex h-full flex-col bg-card/50">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
            <AvatarFallback className="text-xl font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{appointment.customerName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Phone className="h-3.5 w-3.5" />
              {appointment.customerPhone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppointmentActionMenu appointment={appointment} />
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden">
              <span className="sr-only">Close</span>
              &times;
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Date
              </span>
              <p className="font-medium">{format(new Date(appointment.date), "MMM dd, yyyy")}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Time
              </span>
              <p className="font-medium">{appointment.time}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Branch
              </span>
              <p className="font-medium">{BRANCH_LABELS[appointment.branchId]}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" /> Customer ID
              </span>
              <p className="font-medium text-sm truncate" title={appointment.customerUid || appointment.customerId}>
                {appointment.customerUid ? appointment.customerUid.substring(0, 8) + "..." : "Walk-in"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Booking Details
            </h3>
            <div className="rounded-xl border bg-background/50 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{serviceNames || "Standard Service"}</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusChip status={appointment.status} />
              </div>
              {appointment.notes && (
                <div className="pt-2 mt-2 border-t">
                  <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Status Timeline
            </h3>
            <div className="space-y-4 pl-2">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="absolute left-[7px] top-5 -bottom-5 w-px bg-border last:hidden" />
                  <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 ring-4 ring-background">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time ? format(new Date(item.time), "MMM dd, h:mm a") : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Customer History */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Customer History
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4 rounded-xl border bg-background/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Lifetime Visits</p>
                <p className="text-lg font-semibold">{history.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-semibold">₹{lifetimeSpending}</p>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 5).map(visit => {
                  const vPrice = visit.serviceIds.reduce((sum, sId) => {
                    const s = services.find((x) => x.id === sId);
                    return sum + (s?.price || 0);
                  }, 0);
                  return (
                    <div key={visit.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">
                          {visit.serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{format(new Date(visit.date), "MMM dd, yyyy")}</p>
                      </div>
                      <span className="font-semibold text-muted-foreground">₹{vPrice}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No previous visits found.</p>
            )}
          </div>
          
        </div>
      </ScrollArea>
    </div>
  );
}
