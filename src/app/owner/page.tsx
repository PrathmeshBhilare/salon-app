"use client";

import { Activity, CheckCircle2, Clock, UserCheck, Users, UserPlus } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type ShopStatus, type BranchId } from "@/lib/types";
import { PageHeader, StatCard, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { formatTime, relativeTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui-kit";
import { branchService } from "@/lib/services/branchService";
import { todayISO } from "@/lib/format";

export default function OwnerDashboard() {
  const { currentUser, activeBranchId, getShopStatus, appointments, notifications } = useData();
  if (!currentUser) return null;

  const status = getShopStatus(activeBranchId);
  const today = todayISO();
  const todays = appointments.filter((a) => a.branchId === activeBranchId && a.date === today);
  const pending = appointments.filter((a) => a.branchId === activeBranchId && a.status === "pending").length;
  const confirmed = todays.filter((a) => a.status === "confirmed").length;
  const checkedIn = todays.filter((a) => a.status === "checked_in").length;
  const inService = todays.filter((a) => a.status === "in_service").length;
  const completed = todays.filter((a) => a.status === "completed").length;
  const walkins = todays.filter((a) => a.isWalkIn).length;

  const recent = [...todays]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending (All)" value={pending} icon={Clock} />
        <StatCard label="Confirmed (Today)" value={confirmed} icon={UserCheck} />
        <StatCard label="Checked In" value={checkedIn} icon={Users} />
        <StatCard label="In Service" value={inService} icon={Activity} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Walk-ins" value={walkins} icon={UserPlus} />
        <StatCard label="Waiting" value={status.waitingCount} icon={Clock} />
        <StatCard label="Est. Wait" value={`${status.estimatedWaitMin}m`} icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Live Queue Floor">
          <LiveStrip status={status} activeBranchId={activeBranchId} />
          <div className="mt-3 grid gap-3">
            {recent.length === 0 ? (
              <EmptyState icon={Activity} title="No activity today" />
            ) : (
              recent.map((a) => (
                <AppointmentActionCard key={a.id} appointment={a} role="owner" />
              ))
            )}
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
  );
}

function LiveStrip({ status, activeBranchId }: { status: ShopStatus; activeBranchId: BranchId }) {
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
