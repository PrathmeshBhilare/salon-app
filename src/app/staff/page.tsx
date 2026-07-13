"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, MonitorDot, UserCheck, Users, CheckCircle2 } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type ShopStatus, type BranchId } from "@/lib/types";
import { PageHeader, StatCard, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { Button } from "@/components/ui/button";
import { branchService } from "@/lib/services/branchService";
import { todayISO } from "@/lib/format";

export default function StaffDashboard() {
  const { currentUser, activeBranchId, getShopStatus, appointments } = useData();
  const router = useRouter();
  if (!currentUser) return null;

  const status = getShopStatus(activeBranchId);
  const today = todayISO();
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

      <CardLive status={status} activeBranchId={activeBranchId} />

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

function CardLive({ status, activeBranchId }: { status: ShopStatus; activeBranchId: BranchId }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:justify-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Now Serving</p>
        <p className="font-display text-2xl font-bold text-primary">{status.nowServingToken ? `#${status.nowServingToken}` : "—"}</p>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4 py-2 sm:py-0">
        <button 
          onClick={() => branchService.incrementStats(activeBranchId, { waiting: -1 })}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm transition-all hover:bg-rose-200 active:scale-95 dark:bg-rose-900/30 dark:hover:bg-rose-900/50"
        >
          <span className="text-2xl font-bold leading-none">-</span>
        </button>
        <div className="text-center min-w-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Waiting</p>
          <p className="font-display text-5xl font-black leading-none tracking-tight">{status.waitingCount}</p>
        </div>
        <button 
          onClick={() => branchService.incrementStats(activeBranchId, { waiting: 1 })}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm transition-all hover:bg-emerald-200 active:scale-95 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
        >
          <span className="text-2xl font-bold leading-none">+</span>
        </button>
      </div>

      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:justify-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Wait</p>
        <div className="flex items-baseline gap-1">
          <p className="font-display text-2xl font-bold">{status.estimatedWaitMin}</p>
          <span className="text-xs font-medium text-muted-foreground">m</span>
        </div>
      </div>
    </div>
  );
}
