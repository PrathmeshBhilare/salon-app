"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Activity, CheckCircle2, Clock, UserCheck, Users, UserPlus } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, StatCard, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { relativeTime, todayISO } from "@/lib/format";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function OwnerDashboard() {
  const { currentUser, activeBranchId, appointments, notifications } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!currentUser) return null;

  const today = todayISO();
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const branchAppointments = appointments.filter((a) => a.branchId === activeBranchId);
  const todays = branchAppointments.filter((a) => a.date === today);
  const pending = branchAppointments.filter((a) => a.status === "pending").length;
  const confirmed = todays.filter((a) => a.status === "confirmed").length;
  const checkedIn = todays.filter((a) => a.status === "checked_in").length;
  const inService = todays.filter((a) => a.status === "in_service").length;
  const completed = todays.filter((a) => a.status === "completed").length;
  const walkins = todays.filter((a) => a.isWalkIn).length;

  const selectedDateAppointments = branchAppointments.filter((a) => a.date === selectedDateStr);
  const recent = [...selectedDateAppointments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const bookedDates = branchAppointments.map(a => {
    // We append time to avoid timezone offset issues when parsing yyyy-MM-dd
    return new Date(`${a.date}T00:00:00`);
  });

  const activity = notifications
    .filter((n) => n.audience === "owner" || (n.branchId ?? activeBranchId) === activeBranchId)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Dashboard"
        subtitle={`${BRANCH_LABELS[activeBranchId]} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
        action={<div className="hidden sm:block"><BranchSwitcher /></div>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Pending (All)" value={pending} icon={Clock} />
        <StatCard label="Confirmed (Today)" value={confirmed} icon={UserCheck} />
        <StatCard label="Checked In" value={checkedIn} icon={Users} />
        <StatCard label="In Service" value={inService} icon={Activity} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Walk-ins" value={walkins} icon={UserPlus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Section 
          title={selectedDateStr === today ? "Today's Appointments" : `${format(selectedDate, "MMMM d, yyyy")} Appointments`}
          className="min-w-0"
        >
          {recent.length === 0 ? (
            <EmptyState icon={Activity} title="No appointments for this date" />
          ) : (
            <div className="relative px-0 sm:px-12">
              <Carousel 
                opts={{ align: "start" }}
                className="w-full"
              >
                <CarouselContent>
                  {recent.map((a) => (
                    <CarouselItem key={a.id} className="basis-[90%] sm:basis-[350px]">
                      <div className="p-1 h-full">
                        <AppointmentActionCard appointment={a} role="owner" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </div>
          )}
        </Section>

        <div className="space-y-6 min-w-0">
          <Section title="Calendar">
            <div className="flex justify-center rounded-xl border border-border bg-card p-3 shadow-sm">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hasAppointments = branchAppointments.some(a => a.date === dateStr);
                  if (hasAppointments) {
                    window.open(`/owner/appointments?date=${dateStr}`, "_blank");
                  }
                }}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{
                  booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary after:content-['']"
                }}
              />
            </div>
          </Section>

        <Section title="Recent Activity">
          {activity.length === 0 ? (
            <EmptyState icon={Activity} title="No recent activity" />
          ) : (
            <div className="space-y-2">
              {activity.map((n) => (
                <div key={n.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
        </div>
      </div>
    </div>
  );
}
