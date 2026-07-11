"use client";

import { useState } from "react";
import {
  Check,
  LogOut,
  MonitorDot,
  Phone,
  Plus,
  SkipForward,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BranchSwitcher } from "./branch-switcher";
import { StatusBadge } from "@/components/ui-kit";
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

export function ReceptionMode({ onExit }: { onExit: () => void }) {
  const {
    activeBranchId,
    setActiveBranch,
    getBranch,
    getShopStatus,
    queue,
    serving,
    appointments,
    getServicesFor,
    confirmAppointment,
    checkInAppointment,
    startService,
    completeAppointment,
    markNoShow,
    callNext,
    joinWalkIn,
    logout,
    currentUser,
  } = useData();
  const bid = activeBranchId;
  const branch = getBranch(bid);
  const status = getShopStatus(bid);
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkName, setWalkName] = useState("");

  const todays = appointments.filter((a) => a.branchId === bid && a.date === new Date().toISOString().slice(0, 10));
  const pending = todays.filter((a) => a.status === "pending");
  const confirmed = todays.filter((a) => a.status === "confirmed");
  const checkedIn = todays.filter((a) => a.status === "checked_in");
  const inService = todays.filter((a) => a.status === "in_service");
  const queueList = queue[bid] ?? [];

  function serviceNames(ids: string[]) {
    const svcs = getServicesFor(bid);
    return ids.map((id) => svcs.find((s) => s.id === id)?.name ?? "Service").join(", ");
  }

  function addWalkIn() {
    if (!walkName.trim()) return;
    joinWalkIn(bid, walkName.trim(), []);
    toast.success(`${walkName.trim()} added to the queue`);
    setWalkName("");
    setWalkOpen(false);
  }

  const pill = "rounded-full px-3 py-1 text-xs font-medium";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
          G
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">Reception · {BRANCH_LABELS[bid]}</p>
          <p className="text-[11px] text-muted-foreground">
            {status.isOpen ? "Open" : "Closed"} · Now serving{" "}
            <span className="font-semibold text-primary">
              {status.nowServingToken ? `#${status.nowServingToken}` : "—"}
            </span>{" "}
            · {status.waitingCount} waiting · ~{status.estimatedWaitMin}m
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <BranchSwitcher className="h-9" />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setWalkOpen(true)}>
            <Plus className="h-4 w-4" /> Walk-in
          </Button>
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit reception">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-3 sm:p-6 lg:grid-cols-2">
        {/* Now serving + queue */}
        <Card className="overflow-hidden p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Now Serving
          </h2>
          <div className="flex items-center justify-center rounded-2xl bg-primary/10 py-8">
            <div className="text-center">
              <p className="font-display text-6xl font-bold text-primary">
                {status.nowServingToken ? `#${status.nowServingToken}` : "—"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {inService[0]?.customerName ?? "No active service"}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="mt-4 w-full gap-2 text-base"
            disabled={queueList.length === 0}
            onClick={() => {
              callNext(bid);
              toast.success("Called next customer");
            }}
          >
            <SkipForward className="h-5 w-5" /> Call Next
          </Button>

          <h3 className="mb-2 mt-6 text-sm font-semibold">Waiting Queue ({queueList.length})</h3>
          {queueList.length === 0 ? (
            <p className="rounded-xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              Queue is empty.
            </p>
          ) : (
            <ul className="space-y-2">
              {queueList.map((q, i) => (
                <li
                  key={q.token}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
                    {q.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{q.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Next" : `${i} ahead`} · {q.isWalkIn ? "Walk-in" : "Booked"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      callNext(bid);
                      toast.success(`Serving #${q.token}`);
                    }}
                  >
                    <Check className="h-4 w-4" /> Serve
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Action columns */}
        <div className="space-y-4">
          <QueueColumn
            title="Pending"
            count={pending.length}
            empty="No pending bookings."
          >
            {pending.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1" onClick={() => { confirmAppointment(a.id); toast.success("Confirmed"); }}>
                  <Check className="h-4 w-4" /> Confirm
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => { markNoShow(a.id); }}>
                  Reject
                </Button>
              </Row>
            ))}
          </QueueColumn>

          <QueueColumn title="Confirmed" count={confirmed.length} empty="No confirmed bookings.">
            {confirmed.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`${a.time} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1" onClick={() => { checkInAppointment(a.id); toast.success("Checked in"); }}>
                  <UserCheck className="h-4 w-4" /> Check In
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => markNoShow(a.id)}>
                  No Show
                </Button>
              </Row>
            ))}
          </QueueColumn>

          <QueueColumn title="Checked In" count={checkedIn.length} empty="No checked-in customers.">
            {checkedIn.map((a) => (
              <Row key={a.id} name={a.customerName} sub={`Token #${a.token} · ${serviceNames(a.serviceIds)}`}>
                <Button size="sm" className="gap-1" onClick={() => { startService(a.id); toast.success("Started"); }}>
                  <MonitorDot className="h-4 w-4" /> Start
                </Button>
              </Row>
            ))}
          </QueueColumn>

          <QueueColumn title="In Service" count={inService.length} empty="Nothing in service.">
            {inService.map((a) => (
              <Row key={a.id} name={a.customerName} sub={serviceNames(a.serviceIds)}>
                <Button size="sm" className="gap-1" onClick={() => { completeAppointment(a.id); toast.success("Completed"); }}>
                  <Check className="h-4 w-4" /> Complete
                </Button>
                <a href={`tel:${a.customerPhone}`}>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </a>
              </Row>
            ))}
          </QueueColumn>
        </div>
      </div>

      <Dialog open={walkOpen} onOpenChange={setWalkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Walk-in</DialogTitle>
            <DialogDescription>Customer joins the live queue at {BRANCH_LABELS[bid]}.</DialogDescription>
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
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
