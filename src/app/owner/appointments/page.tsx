"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type AppointmentStatus } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_service", label: "In Service" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OwnerAppointments() {
  const { currentUser, activeBranchId, appointments } = useData();
  const [tab, setTab] = useState("all");
  if (!currentUser) return null;

  const list = useMemo(() => {
    return appointments
      .filter((a) => a.branchId === activeBranchId)
      .filter((a) => {
        if (tab === "all") return true;

        if (tab === "completed") return a.status === "completed";
        if (tab === "cancelled")
          return ["cancelled", "rejected", "no_show"].includes(a.status);
        return a.status === (tab as AppointmentStatus);
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, activeBranchId, tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle={`All ${appointments.length} appointments at ${BRANCH_LABELS[activeBranchId]}`}
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
              <AppointmentActionCard key={a.id} appointment={a} role="owner" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
