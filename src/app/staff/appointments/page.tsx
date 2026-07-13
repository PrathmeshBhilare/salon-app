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

import { Input } from "@/components/ui/input";
import { todayISO } from "@/lib/format";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_service", label: "In Service" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StaffAppointments() {
  const { currentUser, activeBranchId, appointments } = useData();
  const [tab, setTab] = useState("all");
  const [filterDate, setFilterDate] = useState<string>(todayISO());
  if (!currentUser) return null;

  const list = useMemo(() => {
    return appointments
      .filter((a) => a.branchId === activeBranchId)
      .filter((a) => (filterDate ? a.date === filterDate : true))
      .filter((a) => {
        if (tab === "all") return true;
        if (tab === "completed") return a.status === "completed";
        if (tab === "cancelled")
          return ["cancelled", "rejected", "no_show"].includes(a.status);
        return a.status === (tab as AppointmentStatus);
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [appointments, activeBranchId, tab, filterDate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        subtitle={`All appointments at ${BRANCH_LABELS[activeBranchId]}`}
        action={<div className="hidden sm:block"><BranchSwitcher /></div>}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="flex h-auto min-h-[36px] w-full flex-wrap justify-start gap-1 py-1">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-xs">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-40 h-10"
          />
        </div>
      </div>

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
