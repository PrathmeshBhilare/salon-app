"use client";

import { Clock, Scissors, Users, Armchair, Hash, UserCheck } from "lucide-react";
import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import type { BranchId } from "@/lib/types";

export function LiveStatusCard({ branchId }: { branchId: BranchId }) {
  const { getBranch, getShopStatus } = useData();
  const branch = getBranch(branchId);
  const status = getShopStatus(branchId);

  return (
    <Card className="relative overflow-hidden p-5 shadow-sm">
      <div
        className={
          "absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold " +
          (status.isOpen
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300")
        }
      >
        {status.isOpen ? "Open Now" : "Closed"}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {branch.name} · Live Status
      </p>
      <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
        <Metric
          icon={Users}
          label="Waiting"
          value={status.waitingCount}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-950"
        />
        <Metric
          icon={Scissors}
          label="In Service"
          value={status.inServiceCount}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-950"
        />
        <Metric
          icon={UserCheck}
          label="In Shop"
          value={status.inShopCount}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100 dark:bg-emerald-950"
        />
        <Metric
          icon={Clock}
          label="Est. Wait"
          value={`${status.estimatedWaitMin}m`}
          color="text-orange-600 dark:text-orange-400"
          bgColor="bg-orange-100 dark:bg-orange-950"
        />
        <Metric
          icon={Hash}
          label="Now Serving"
          value={status.nowServingToken ? `#${status.nowServingToken}` : "—"}
          color="text-violet-600 dark:text-violet-400"
          bgColor="bg-violet-100 dark:bg-violet-950"
        />
        <Metric
          icon={Armchair}
          label="Chairs"
          value={`${status.availableChairs}/${status.totalChairs}`}
          color="text-primary"
          bgColor="bg-primary/10"
        />
      </div>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${bgColor}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className={`font-display text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

