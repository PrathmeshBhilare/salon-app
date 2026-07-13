"use client";

import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import type { BranchId } from "@/lib/types";
import { MapPin, Users, Scissors, Clock, Activity } from "lucide-react";

export function LiveStatusCard({ branchId }: { branchId: BranchId }) {
  const { getBranch, getShopStatus } = useData();
  const branch = getBranch(branchId);
  const status = getShopStatus(branchId);

  const getCrowdLevel = (count: number) => {
    if (count <= 3) return { label: "Quiet", color: "text-emerald-600 dark:text-emerald-400", icon: "🟢", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (count <= 7) return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", icon: "🟡", bg: "bg-yellow-500/10 border-yellow-500/20" };
    if (count <= 12) return { label: "Busy", color: "text-orange-600 dark:text-orange-400", icon: "🟠", bg: "bg-orange-500/10 border-orange-500/20" };
    return { label: "Very Busy", color: "text-rose-600 dark:text-rose-400", icon: "🔴", bg: "bg-rose-500/10 border-rose-500/20" };
  };

  const crowd = getCrowdLevel(status.inShopCount);

  return (
    <Card className="relative mx-auto w-full max-w-3xl overflow-hidden p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8 border-2 border-primary/5">
      {/* Header Row */}
      <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground sm:text-base">{branch.name}</h3>
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">Live Queue Status</p>
          </div>
        </div>
        <div
          className={
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider " +
            (status.isOpen
              ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-rose-500/15 text-rose-700 dark:bg-rose-950 dark:text-rose-400")
          }
        >
          {status.isOpen ? "Open Now" : "Closed"}
        </div>
      </div>

      {/* Grid Layout for Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        
        {/* Customers in Salon */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/40 p-4 text-center border border-border/50">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
             <Users className="h-4 w-4 text-foreground/70" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">In Salon</p>
          <p className="mt-1 font-display text-3xl font-bold">{status.inShopCount}</p>
        </div>

        {/* On Chair */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-primary/5 p-4 text-center border border-primary/10">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
             <Scissors className="h-4 w-4 text-primary" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">On Chair</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{status.inServiceCount}</p>
        </div>

        {/* Estimated Wait */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary/40 p-4 text-center border border-border/50">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
             <Clock className="h-4 w-4 text-foreground/70" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Wait Time</p>
          <div className="mt-1 flex items-baseline justify-center gap-1">
             <p className="font-display text-3xl font-bold">{status.estimatedWaitMin}</p>
             <span className="text-sm font-medium text-muted-foreground">m</span>
          </div>
        </div>

        {/* Crowd Level */}
        <div className={`flex flex-col items-center justify-center rounded-2xl p-4 text-center border ${crowd.bg}`}>
          <div className="mb-2 text-2xl drop-shadow-sm">{crowd.icon}</div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${crowd.color}`}>Crowd</p>
          <p className={`mt-1 font-display text-lg font-bold ${crowd.color}`}>{crowd.label}</p>
        </div>

      </div>

      {/* Footer Status */}
      <div className="mt-6 flex items-center justify-center gap-2 pt-2 text-xs font-semibold tracking-wide text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        Updated Live
      </div>
    </Card>
  );
}
