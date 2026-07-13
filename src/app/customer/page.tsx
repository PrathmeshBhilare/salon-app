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
import { LiveStatusCard } from "@/components/branch/live-status";
import { MyQueueCard } from "@/components/branch/my-queue";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { formatPrice, formatTime } from "@/lib/format";
import { BRANCH_LABELS } from "@/lib/types";

export default function CustomerDashboard() {
  const { currentUser, appointments, activeBranchId, getBranch, getServicesFor, getOffersFor } = useData();
  const { t } = useTranslation();
  
  if (!currentUser) return null;
  const branch = getBranch(activeBranchId);
  const services = getServicesFor(activeBranchId);
  const offers = getOffersFor(activeBranchId).filter((o) => o.active).slice(0, 4);
  const popular = services.slice(0, 4);
  const upcoming = appointments.filter((a) => a.status === "confirmed");
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

      <LiveStatusCard branchId={activeBranchId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/customer/book" className="group">
          <Card className="flex h-full items-center gap-4 p-5 shadow-sm transition-transform group-hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t("book.title")}</p>
              <p className="text-sm text-muted-foreground">{t("book.subtitle")}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Card>
        </Link>
        <MyQueueCardWrapper />
      </div>

      <Section title={`${t("dashboard.upcoming")} (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={t("dashboard.no_upcoming")}
            description={t("dashboard.book_visit")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((a) => (
              <Card key={a.id} className="p-4 shadow-sm">
                <p className="font-medium">
                  {getServicesFor(a.branchId)
                    .filter((s) => a.serviceIds.includes(s.id))
                    .map((s) => s.name)
                    .join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">{a.date} at {a.time}</p>
              </Card>
            ))}
          </div>
        )}
      </Section>

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

      <Section title="Popular Services" description={`At ${BRANCH_LABELS[activeBranchId]}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          {popular.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-3 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.durationMin} min</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(s.price)}</p>
                <Link href="/customer/book" className="text-xs font-medium text-primary hover:underline">
                  Book
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Salon Information">
        <Card className="space-y-4 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{branch.name} Branch</p>
              <p className="text-sm text-muted-foreground">{branch.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Working Hours</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {branch.workingHours.map((w) => (
                  <span key={w.day}>
                    {w.day}: {w.closed ? "Closed" : `${formatTime(w.open)} – ${formatTime(w.close)}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(branch.name + " Glow and Glamour " + branch.address)}&output=embed`}
              className="h-48 w-full"
              loading="lazy"
            />
          </div>
          <div className="flex gap-2">
            <a href={`tel:${branch.phone}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Phone className="h-4 w-4" /> Call {branch.phone}
              </Button>
            </a>
            <a href={branch.mapsUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <MapPin className="h-4 w-4" /> Directions
              </Button>
            </a>
          </div>
        </Card>
      </Section>
    </div>
  );
}

function MyQueueCardWrapper() {
  const { activeBranchId } = useData();
  // reuse MyQueueCard but ensure it renders the join CTA as the second card
  return <MyQueueCard branchId={activeBranchId} />;
}
