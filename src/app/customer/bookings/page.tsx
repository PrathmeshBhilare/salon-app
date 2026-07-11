"use client";

import { useState } from "react";
import { CalendarCheck, X } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { AppointmentCard } from "@/components/appointment-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatTime } from "@/lib/format";

export default function CustomerBookings() {
  const { currentUser, appointments, cancelAppointment } = useData();
  const [toCancel, setToCancel] = useState<string | null>(null);

  if (!currentUser) return null;
  const mine = appointments
    .filter((a) => a.customerId === currentUser.id)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const upcoming = mine.filter((a) => !["completed", "cancelled", "rejected", "no_show"].includes(a.status));
  const past = mine.filter((a) => ["completed", "cancelled", "rejected", "no_show"].includes(a.status));

  const target = mine.find((a) => a.id === toCancel);

  return (
    <div className="space-y-6">
      <PageHeader title="My Bookings" subtitle="Track and manage your appointments." />

      <Section title={`Upcoming (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No upcoming bookings" description="Book a visit from the Home screen." />
        ) : (
          <div className="grid gap-3">
            {upcoming.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                action={
                  (a.status === "pending" || a.status === "confirmed") && (
                    <Button variant="outline" size="sm" className="gap-1 text-rose-600" onClick={() => setToCancel(a.id)}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  )
                }
              />
            ))}
          </div>
        )}
      </Section>

      {past.length > 0 && (
        <Section title={`History (${past.length})`}>
          <div className="grid gap-3">
            {past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </Section>
      )}

      <Dialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
            <DialogDescription>
              {target?.reference} on {target?.date} at {target && formatTime(target.time)} will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToCancel(null)}>
              Keep it
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (toCancel) {
                  cancelAppointment(toCancel);
                  toast.success("Appointment cancelled");
                }
                setToCancel(null);
              }}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
