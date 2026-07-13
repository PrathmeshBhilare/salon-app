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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentStatus } from "@/lib/types";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CustomerBookings() {
  const { currentUser, appointments, cancelAppointment } = useData();
  const { t } = useTranslation();
  const [toCancel, setToCancel] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  if (!currentUser) return null;
  
  const list = appointments
    .filter((a) => a.customerId === currentUser.id)
    .filter((a) => {
      if (tab === "all") return true;
      if (tab === "cancelled") return ["cancelled", "rejected", "no_show"].includes(a.status);
      return a.status === (tab as AppointmentStatus);
    })
    .sort((a, b) => {
      if (sortBy === "time") {
        return (a.date + a.time).localeCompare(b.date + b.time);
      } else {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
    });

  const target = appointments.find((a) => a.id === toCancel);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("nav.bookings")} 
        subtitle={t("bookings.subtitle")} 
        action={
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newly Booked</SelectItem>
              <SelectItem value="time">By Time</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="text-xs">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Section>
        {list.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No bookings found" description="Try changing the filters." />
        ) : (
          <div className="grid gap-3">
            {list.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                action={
                  (a.status === "pending" || a.status === "confirmed") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-rose-600" 
                      onClick={() => {
                        if (a.status === "confirmed") {
                          toast("Cannot cancel", {
                            description: "Your appointment is confirmed. Please contact the salon for any queries.",
                            action: { label: "Dismiss", onClick: () => {} },
                          });
                        } else {
                          setToCancel(a.id);
                        }
                      }}
                    >
                      <X className="h-4 w-4" /> {t("bookings.cancel")}
                    </Button>
                  )
                }
              />
            ))}
          </div>
        )}
      </Section>

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
