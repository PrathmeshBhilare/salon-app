"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, MonitorDot, UserCheck, Users, CheckCircle2 } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type ShopStatus } from "@/lib/types";
import { PageHeader, StatCard, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const { currentUser, activeBranchId, getShopStatus, appointments } = useData();
  const router = useRouter();
  if (!currentUser) return null;

  const status = getShopStatus(activeBranchId);
  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => a.branchId === activeBranchId && a.date === today);
  const pending = todays.filter((a) => a.status === "pending");
  const confirmed = todays.filter((a) => a.status === "confirmed");
  const checkedIn = todays.filter((a) => a.status === "checked_in");
  const inService = todays.filter((a) => a.status === "in_service");
  const actionNeeded = [...pending, ...confirmed, ...checkedIn, ...inService].sort((a, b) =>
    (a.time).localeCompare(b.time)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${BRANCH_LABELS[activeBranchId]} Floor`}
        subtitle="Today's operations at a glance."
        action={
          <div className="hidden items-center gap-2 sm:flex">
            <BranchSwitcher />
            <Button className="gap-2" onClick={() => router.push("/staff-reception")}>
              <MonitorDot className="h-4 w-4" /> Reception
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={pending.length} icon={ClipboardList} />
        <StatCard label="Confirmed" value={confirmed.length} icon={UserCheck} />
        <StatCard label="Checked In" value={checkedIn.length} icon={Users} />
        <StatCard label="In Service" value={inService.length} icon={CheckCircle2} />
      </div>

      <CardLive status={status} />

      <Section title="Needs Attention" description="Confirm, check-in, start or complete.">
        {actionNeeded.length === 0 ? (
          <EmptyState icon={ClipboardList} title="All clear" description="No appointments need action right now." />
        ) : (
          <div className="grid gap-3">
            {actionNeeded.map((a) => (
              <AppointmentActionCard key={a.id} appointment={a} role="staff" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function CardLive({ status }: { status: ShopStatus }) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Now Serving</p>
        <p className="font-display text-2xl font-bold text-primary">{status.nowServingToken ? `#${status.nowServingToken}` : "—"}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Waiting</p>
        <p className="font-display text-2xl font-bold">{status.waitingCount}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Est. Wait</p>
        <p className="font-display text-2xl font-bold">{status.estimatedWaitMin}m</p>
      </div>
    </div>
  );
}
