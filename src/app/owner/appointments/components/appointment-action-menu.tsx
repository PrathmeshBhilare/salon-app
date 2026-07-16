"use client";

import { MoreHorizontal, Phone, CheckCircle, Clock, Play, CheckCircle2, XCircle, FileText, History } from "lucide-react";
import { useData } from "@/lib/store";
import { type Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentActionMenuProps {
  appointment: Appointment;
  onViewDetails?: () => void;
  onViewHistory?: () => void;
}

export function AppointmentActionMenu({ appointment, onViewDetails, onViewHistory }: AppointmentActionMenuProps) {
  const {
    confirmAppointment,
    checkInAppointment,
    startService,
    completeAppointment,
    cancelAppointment,
  } = useData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onViewDetails && (
          <DropdownMenuItem onClick={onViewDetails} className="hidden sm:flex">
            <FileText className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <a href={`tel:${appointment.customerPhone}`}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Call Customer</span>
          </a>
        </DropdownMenuItem>
        
        {onViewHistory && (
          <DropdownMenuItem onClick={onViewHistory}>
            <History className="mr-2 h-4 w-4" />
            <span>Customer History</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {appointment.status === "pending" && (
          <DropdownMenuItem onClick={() => confirmAppointment(appointment.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Confirm</span>
          </DropdownMenuItem>
        )}
        {["pending", "confirmed"].includes(appointment.status) && (
          <DropdownMenuItem onClick={() => checkInAppointment(appointment.id)}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Check In</span>
          </DropdownMenuItem>
        )}
        {["confirmed", "checked_in"].includes(appointment.status) && (
          <DropdownMenuItem onClick={() => startService(appointment.id)}>
            <Play className="mr-2 h-4 w-4" />
            <span>Start Service</span>
          </DropdownMenuItem>
        )}
        {appointment.status === "in_service" && (
          <DropdownMenuItem onClick={() => completeAppointment(appointment.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>Complete Service</span>
          </DropdownMenuItem>
        )}
        
        {["pending", "confirmed", "checked_in"].includes(appointment.status) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => cancelAppointment(appointment.id)}
              className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Cancel Appointment</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
