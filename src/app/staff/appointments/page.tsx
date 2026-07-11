"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type AppointmentStatus } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FILTERS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_service", label: "In Service" },
  { value: "completed", label: "Done" },
];

export default function StaffAppointments() {
  const { currentUser, activeBranchId, appointments } = useData();
  const [tab, setTab] = useState("active");
  if (!currentUser) return null;

  const list = useMemo(() => {
    return appointments
      .filter((a) => a.branchId === activeBranchId)
      .filter((a) => {
        if (tab === "active")
          return ["pending", "confirmed", "checked_in", "in_service"].includes(a.status);
        if (tab === "completed")
          return ["completed", "cancelled", "rejected", "no_show"].includes(a.status);
        return a.status === (tab as AppointmentStatus);
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, activeBranchId, tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        subtitle={`All appointments at ${BRANCH_LABELS[activeBranchId]}`}
        action={<div className="hidden sm:block"><BranchSwitcher /></div>}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="text-xs">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Section>
        {list.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Nothing here" description="No appointments match this filter." />
        ) : (
          <div className="grid gap-3">
            {list.map((a) => (
              <AppointmentActionCard key={a.id} appointment={a} role="staff" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
