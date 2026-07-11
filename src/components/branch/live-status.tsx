"use client";

import { Clock, MapPin, Phone, Users } from "lucide-react";
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
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric
          icon={Users}
          label="Waiting"
          value={status.waitingCount}
        />
        <Metric
          icon={Clock}
          label="Est. Wait"
          value={`${status.estimatedWaitMin}m`}
        />
        <Metric
          icon={MapPin}
          label="Now Serving"
          value={status.nowServingToken ? `#${status.nowServingToken}` : "—"}
        />
        <Metric
          icon={Phone}
          label="Chairs"
          value={`${status.availableChairs}/${status.totalChairs}`}
        />
      </div>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}
