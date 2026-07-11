"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentCard } from "@/components/appointment-card";
import { cn } from "@/lib/utils";
import { addDaysISO, formatDate } from "@/lib/format";

export default function StaffSchedule() {
  const { currentUser, activeBranchId, appointments } = useData();
  const [dayOffset, setDayOffset] = useState(0);
  if (!currentUser) return null;

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(i)), []);

  const dayList = useMemo(() => {
    const d = days[dayOffset];
    return appointments
      .filter((a) => a.branchId === activeBranchId && a.date === d)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, activeBranchId, dayOffset, days]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        subtitle={`Upcoming roster at ${BRANCH_LABELS[activeBranchId]}`}
        action={<div className="hidden sm:block"><BranchSwitcher /></div>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => {
          const dt = new Date(d);
          const on = dayOffset === i;
          return (
            <button
              key={d}
              onClick={() => setDayOffset(i)}
              className={cn(
                "flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
              )}
            >
              <span className="text-xs uppercase">{dt.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <span className="font-display text-lg font-semibold">{dt.getDate()}</span>
            </button>
          );
        })}
      </div>

      <Section title={formatDate(days[dayOffset])}>
        {dayList.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No appointments" description="This day is free at this branch." />
        ) : (
          <div className="grid gap-3">
            {dayList.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
