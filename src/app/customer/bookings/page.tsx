"use client";

import { useState } from "react";
import { CalendarCheck, X } from "lucide-react";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
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
      <PageHeader title={t("nav.bookings")} subtitle={t("notifications.subtitle")} />

      <Section title={`${t("dashboard.upcoming")} (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={t("dashboard.no_upcoming")} description={t("dashboard.book_visit")} />
        ) : (
          <div className="grid gap-3">
            {upcoming.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                action={
                  (a.status === "pending" || a.status === "confirmed") && (
                    <Button variant="outline" size="sm" className="gap-1 text-rose-600" onClick={() => setToCancel(a.id)}>
                      <X className="h-4 w-4" /> {t("bookings.cancel")}
                    </Button>
                  )
                }
              />
            ))}
          </div>
        )}
      </Section>

      {past.length > 0 && (
        <Section title={`${t("bookings.history")} (${past.length})`}>
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
            <DialogTitle>{t("bookings.cancel_title")}</DialogTitle>
            <DialogDescription>
              {target?.reference} {t("bookings.cancel_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToCancel(null)}>
              {t("bookings.keep_it")}
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                if (toCancel) {
                  try {
                    await cancelAppointment(toCancel);
                    toast.success("Appointment cancelled");
                  } catch {
                    toast.error("Could not cancel");
                  }
                }
                setToCancel(null);
              }}
            >
              {t("bookings.cancel_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
