"use client";

import { useData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Ticket } from "lucide-react";
import type { BranchId } from "@/lib/types";
import { toast } from "sonner";

export function MyQueueCard({ branchId }: { branchId: BranchId }) {
  const { currentUser, queue, joinWalkIn, getShopStatus } = useData();
  if (!currentUser) return null;

  const q = queue[branchId] ?? [];
  const myEntry = q.find(
    (e) => e.customerUid === currentUser.uid
  );
  const status = getShopStatus(branchId);
  const position = myEntry ? q.findIndex((e) => e.token === myEntry.token) + 1 : 0;

  function join() {
    if (!currentUser) return;
    joinWalkIn(branchId, currentUser.fullName, []);
    toast.success("You joined the walk-in queue");
  }

  if (myEntry) {
    return (
      <Card className="border-primary/30 bg-primary/5 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Ticket className="h-5 w-5" />
          <p className="text-sm font-semibold">You're in the queue</p>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="font-display text-5xl font-bold text-primary">#{myEntry.token}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {position === 1 ? "You're next!" : `${position - 1} ahead of you`} · ~
              {(position - 1) * 30}m wait
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Now serving</p>
            <p className="font-display text-xl font-semibold text-foreground">
              {status.nowServingToken ? `#${status.nowServingToken}` : "—"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-4 p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CalendarClock className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="font-medium">Skip the wait — join the walk-in queue</p>
        <p className="text-sm text-muted-foreground">
          Get a live token and we'll call you when it's your turn.
        </p>
      </div>
      <Button onClick={join} className="shrink-0">
        Join Queue
      </Button>
    </Card>
  );
}
