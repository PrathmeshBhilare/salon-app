"use client";

import { useState } from "react";
import {
  Check,
  Phone,
  Plus,
  MonitorDot,
  UserCheck,
  X,
  LayoutGrid,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BranchSwitcher } from "./branch-switcher";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceCatalog } from "./service-catalog";

export function ReceptionMode({ onExit }: { onExit: () => void }) {
  const {
    activeBranchId,
    getBranch,
    getShopStatus,
    liveQueue,
    appointments,
    getServicesFor,
    confirmAppointment,
    checkInAppointment,
    startService,
    completeAppointment,
    markNoShow,
    joinWalkIn,
  } = useData();
  const bid = activeBranchId;
  const branch = getBranch(bid);
  const status = getShopStatus(bid);
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkName, setWalkName] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);

  const todays = appointments.filter((a) => a.branchId === bid && a.date === new Date().toISOString().slice(0, 10));
  const pending = todays.filter((a) => a.status === "pending");
  const confirmed = todays.filter((a) => a.status === "confirmed");

  const branchQueue = liveQueue.filter(q => q.branchId === bid);
  const waitingList = branchQueue.filter(q => q.status === "waiting");
  const inServiceList = branchQueue.filter(q => q.status === "in_service");

  function serviceNames(ids: string[]) {
    const svcs = getServicesFor(bid);
    return ids.map((id) => svcs.find((s) => s.id === id)?.name ?? "Service").join(", ");
  }

  async function addWalkIn() {
    if (!walkName.trim()) return;
    try {
      await joinWalkIn(bid, walkName.trim(), []);
      toast.success("Added to the queue");
    } catch {
      toast.error("Could not add walk-in");
    }
    setWalkName("");
    setWalkOpen(false);
  }

  const run = (fn: () => Promise<void>, msg: string) => () => {
    fn()
      .then(() => toast.success(msg))
      .catch(() => toast.error("Action failed. Please try again."));
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
          G
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">Reception · {BRANCH_LABELS[bid]}</p>
          <p className="text-[11px] text-muted-foreground">
            {status.isOpen ? "Open" : "Closed"} · {status.waitingCount} waiting · ~{status.estimatedWaitMin}m Wait
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <BranchSwitcher className="h-9 max-w-[42vw]" />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCatalogOpen(true)}>
            <LayoutGrid className="h-4 w-4" /> Catalog
          </Button>
          <Button variant="default" size="sm" className="gap-2" onClick={() => setWalkOpen(true)}>
            <Plus className="h-4 w-4" /> Check-In
          </Button>
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit reception">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-3 sm:p-6 lg:grid-cols-2">
        {/* Left Column: Live Queue */}
        <div className="space-y-4">
          <Card className="overflow-hidden p-5 shadow-sm border-emerald-100 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900/30">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              In Service ({inServiceList.length} / {status.totalChairs})
            </h2>
            {inServiceList.length === 0 ? (
              <p className="rounded-xl bg-emerald-100/50 px-4 py-8 text-center text-sm text-emerald-700/70 dark:bg-emerald-900/20 dark:text-emerald-400">
                No active services right now.
              </p>
            ) : (
              <ul className="space-y-2">
                {inServiceList.map((q) => (
                  <li key={q.id} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/40">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      <MonitorDot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-emerald-950 dark:text-emerald-50">{q.customerName}</p>
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                        Started at {new Date(q.serviceStartTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={run(() => completeAppointment(q.appointmentId!), `Completed ${q.customerName}`)}
                    >
                      <Check className="h-4 w-4" /> Complete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Waiting Queue ({waitingList.length})</h3>
            {waitingList.length === 0 ? (
              <p className="rounded-xl bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Queue is empty.
              </p>
            ) : (
              <ul className="space-y-2">
                {waitingList.map((q, i) => {
                  const waitDurationMin = Math.round((Date.now() - new Date(q.arrivalTime).getTime()) / 60000);
                  return (
                    <li
                      key={q.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{q.customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {q.isWalkIn ? "Walk-in" : "Booked"} · Waiting {waitDurationMin}m 
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1"
                        onClick={run(() => startService(q.appointmentId!), `Serving ${q.customerName}`)}
                      >
                        <Check className="h-4 w-4" /> Start
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column: Bookings */}
        <div className="space-y-4">
          <QueueColumn
            title="Incoming Bookings (Pending)"
            count={pending.length}
            empty="No pending bookings."
          >
            {pending.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1" onClick={run(() => confirmAppointment(a.id), "Confirmed")}>
                  <Check className="h-4 w-4" /> Confirm
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-500" onClick={run(() => markNoShow(a.id), "Rejected")}>
                  Reject
                </Button>
              </Row>
            ))}
          </QueueColumn>

          <QueueColumn title="Upcoming (Confirmed)" count={confirmed.length} empty="No confirmed bookings.">
            {confirmed.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:border-amber-800" onClick={run(() => checkInAppointment(a.id), "Checked in to Live Queue")}>
                  <UserCheck className="h-4 w-4" /> Move to Live Queue
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-500" onClick={run(() => markNoShow(a.id), "No Show")}>
                  No Show
                </Button>
              </Row>
            ))}
          </QueueColumn>
        </div>
      </div>

      <Dialog open={walkOpen} onOpenChange={setWalkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-In Walk-in</DialogTitle>
            <DialogDescription>Customer immediately joins the live queue at {BRANCH_LABELS[bid]}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="walk-name">Customer name</Label>
            <Input
              id="walk-name"
              value={walkName}
              onChange={(e) => setWalkName(e.target.value)}
              placeholder="e.g. Walk-in Guest"
              onKeyDown={(e) => e.key === "Enter" && addWalkIn()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addWalkIn} disabled={!walkName.trim()}>
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-hidden p-0 sm:p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-display">Service Catalog</DialogTitle>
            <DialogDescription>
              Browse all our services. Click arrows or swipe to see more.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 pb-12">
            <ServiceCatalog services={getServicesFor(bid)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueColumn({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="rounded-xl bg-muted/40 px-4 py-5 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </Card>
  );
}

function Row({
  name,
  sub,
  children,
}: {
  name: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
