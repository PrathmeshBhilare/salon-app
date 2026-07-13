"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  Scissors,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatPrice, formatTime, addDaysISO, todayISO } from "@/lib/format";
import { toast } from "sonner";

const STEP_LABELS = ["Branch", "Service", "Date", "Time", "Review"];

export default function BookPage() {
  const { currentUser, activeBranchId, setActiveBranch, branches, getBranch, getServicesFor, bookAppointment } =
    useData();
  const { t } = useTranslation();
  if (!currentUser) return null;

  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState<BranchId>(activeBranchId);
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState(addDaysISO(0));
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const services = getServicesFor(branchId);
  const branch = getBranch(branchId);
  const total = services
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
  const totalMin = services
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + s.durationMin, 0);

  const dates = useMemo(() => Array.from({ length: 10 }, (_, i) => addDaysISO(i)), []);

  const slots = useMemo(() => {
    const dayName = new Date(date).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
    const wh = branch.workingHours.find((w) => w.day === dayName);
    if (!wh || wh.closed) return [];
    const [oh, om] = wh.open.split(":").map(Number);
    const [ch, cm] = wh.close.split(":").map(Number);
    const start = oh * 60 + om;
    const end = ch * 60 + cm;

    const isToday = date === todayISO();
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const out: string[] = [];
    for (let m = start; m + 30 <= end; m += 30) {
      if (isToday && m <= currentMins) continue;
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      out.push(`${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`);
    }
    return out;
  }, [date, branch]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof services>();
    for (const s of services) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries());
  }, [services]);

  function toggleService(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function next() {
    if (step === 0 && branchId !== activeBranchId) setActiveBranch(branchId);
    if (step < 4) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submit() {
    const appt = await bookAppointment({
      customerId: currentUser!.id,
      customerName: currentUser!.fullName,
      customerPhone: currentUser!.phone,
      branchId,
      serviceIds: selected,
      date,
      time,
      notes: notes.trim() || undefined,
    });
    setDone({ ref: appt.reference });
    toast.success("Appointment booked!");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
          <Check className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Booking Received</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference <span className="font-semibold text-foreground">{done.ref}</span>. The salon will confirm shortly.
          </p>
        </div>
        <Card className="space-y-2 p-4 text-left text-sm">
          <Row label={t("branch")} value={BRANCH_LABELS[branchId]} />
          <Row label={t("date")} value={date} />
          <Row label={t("time")} value={formatTime(time)} />
          <Row label={t("services")} value={selected.length.toString()} />
          <Row label={t("total")} value={formatPrice(total)} />
        </Card>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/customer/bookings">{t("My Bookings")}</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/customer">{t("Home")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canNext =
    (step === 0 && true) ||
    (step === 1 && selected.length > 0) ||
    (step === 2 && !!date) ||
    (step === 3 && !!time) ||
    step === 4;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("hidden text-xs sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>
              {i === 0 && t("branch")}
              {i === 1 && t("services")}
              {i === 2 && t("date")}
              {i === 3 && t("time")}
              {i === 4 && t("book.review")}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-5 shadow-sm">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">{t("book.choose_branch")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBranchId(b.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    branchId === b.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{b.name}</p>
                    {branchId === b.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.tagline}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {b.address}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t("book.choose_services")}</h2>
              <span className="text-xs text-muted-foreground">{selected.length} {t("book.selected")}</span>
            </div>
            {grouped.length > 0 ? (
              <Tabs defaultValue={grouped[0]?.[0] || ""}>
                <TabsList className="w-full h-auto flex flex-wrap">
                  {grouped.map(([cat]) => (
                    <TabsTrigger key={cat} value={cat} className="flex-1 uppercase tracking-wide text-[10px] sm:text-xs min-w-[80px]">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {grouped.map(([cat, items]) => (
                  <TabsContent key={cat} value={cat} className="space-y-2 mt-4 max-h-[50vh] overflow-y-auto pr-1 pb-1 custom-scrollbar">
                    {items.map((s) => {
                      const on = selected.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleService(s.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                            on ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-accent"
                          )}
                        >
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                            on ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                          )}>
                            <Scissors className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.durationMin} {t("min")}</p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <p className="font-semibold text-primary">{formatPrice(s.price)}</p>
                            <div
                              className={cn(
                                "mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                              )}
                            >
                              {on && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">{t("book.no_services")}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-semibold">{t("book.choose_date")}</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {dates.map((d) => {
                const dt = new Date(d);
                const on = date === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition-colors",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    )}
                  >
                    <p className="text-xs uppercase">{dt.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                    <p className="font-display text-xl font-semibold">{dt.getDate()}</p>
                    <p className="text-[10px] opacity-80">{dt.toLocaleDateString("en-IN", { month: "short" })}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="font-semibold">{t("book.choose_time")}</h2>
            {slots.length === 0 ? (
              <p className="rounded-xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                {t("book.closed")}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                      time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    )}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">{t("book.review")}</h2>
            <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
              <Row label={t("branch")} value={BRANCH_LABELS[branchId]} />
              <Row label={t("date")} value={date} />
              <Row label={t("time")} value={formatTime(time)} />
              <Row
                label={t("services")}
                value={services
                  .filter((s) => selected.includes(s.id))
                  .map((s) => s.name)
                  .join(", ")}
              />
              <Row label={t("duration")} value={`${totalMin} ${t("min")}`} />
              <Row label={t("total")} value={formatPrice(total)} highlight />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t("book.notes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("book.special_requests")}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> {t("book.back")}
        </Button>
        {step < 4 ? (
          <Button onClick={next} disabled={!canNext} className="gap-1">
            {t("book.next")} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} className="gap-1">
            <CalendarPlus className="h-4 w-4" /> {t("book.button")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", highlight && "text-primary")}>{value}</span>
    </div>
  );
}
