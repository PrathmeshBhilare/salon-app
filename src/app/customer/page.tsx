"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  Scissors,
  PlusCircle,
} from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { useTranslation } from "@/lib/i18n";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { formatPrice, formatTime } from "@/lib/format";
import { BRANCH_LABELS, STATUS_LABELS } from "@/lib/types";

export default function CustomerDashboard() {
  const { currentUser, appointments, activeBranchId, getBranch, getServicesFor, getOffersFor, getShopStatus } = useData();
  const { t } = useTranslation();
  
  if (!currentUser) return null;
  const branch = getBranch(activeBranchId);
  const status = getShopStatus(activeBranchId);
  const services = getServicesFor(activeBranchId);
  const offers = getOffersFor(activeBranchId).filter((o) => o.active).slice(0, 4);
  const popular = services.slice(0, 4);
  const upcoming = appointments.filter((a) => ["pending", "confirmed", "checked_in", "in_service"].includes(a.status));
  const firstName = (currentUser.fullName || "Guest").split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${firstName}`}
        subtitle={t("dashboard.book_visit")}
        action={
          <div className="hidden sm:block">
            <BranchSwitcher />
          </div>
        }
      />

      <div className="sm:hidden">
        <BranchSwitcher className="w-full justify-between" />
      </div>

      {upcoming.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary">
            <CalendarCheck className="w-5 h-5" /> Your Active Bookings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((a) => {
              const servicesList = getServicesFor(a.branchId)
                .filter((s) => a.serviceIds.includes(s.id))
                .map((s) => s.name)
                .join(", ");
                
              return (
                <Link href="/customer/bookings" key={a.id}>
                  <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background p-5 shadow-lg transition-transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm">
                      {STATUS_LABELS[a.status].toUpperCase()}
                    </div>
                    <div className="mb-4 pr-20">
                      <p className="text-2xl font-bold tracking-tight text-foreground">{a.date}</p>
                      <p className="text-lg font-semibold text-primary">{formatTime(a.time)}</p>
                    </div>
                    <div className="space-y-1.5 border-t border-primary/10 pt-3">
                      <p className="text-sm font-medium leading-tight">{servicesList}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5"/> {BRANCH_LABELS[a.branchId]} Branch
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">Live Branch Status</h2>
        <Card className="p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">{BRANCH_LABELS[activeBranchId]}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-sm text-muted-foreground">{status.isOpen ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{status.waitingCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Waiting</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Service</p>
              <p className="font-medium mt-0.5">{status.inServiceCount} <span className="text-muted-foreground">/ {status.totalChairs}</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Wait</p>
              <p className="font-medium mt-0.5">~{status.estimatedWaitMin}m</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Link href="/customer/book" className="group block">
          <Card className="flex h-full items-center gap-4 p-5 shadow-sm transition-transform group-hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t("book.title")}</p>
              <p className="text-sm text-muted-foreground">{t("book.subtitle")}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
          </Card>
        </Link>
      </div>

      {offers.length > 0 && (
        <Section title="Latest Offers" action={<Link href="/customer/offers" className="text-sm font-medium text-primary">View all</Link>}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {offers.map((o) => (
              <Card key={o.id} className="min-w-[240px] shrink-0 overflow-hidden shadow-sm">
                <div className="bg-primary/10 px-4 py-2">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {o.badge}
                  </span>
                </div>
                <div className="space-y-1 p-4">
                  <p className="font-semibold">{o.title}</p>
                  <p className="text-sm text-muted-foreground">{o.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
