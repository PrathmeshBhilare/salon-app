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
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatPrice, formatTime, addDaysISO } from "@/lib/format";
import { toast } from "sonner";

const STEP_LABELS = ["Branch", "Service", "Date", "Time", "Review"];

export default function BookPage() {
  const { currentUser, activeBranchId, setActiveBranch, branches, getBranch, getServicesFor, bookAppointment } =
    useData();
  if (!currentUser) return null;

  const [step, setStep] = useState(0);
  const [branchId, setBranchId] = useState<BranchId>(activeBranchId);
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState(addDaysISO(1));
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

  const dates = useMemo(() => Array.from({ length: 10 }, (_, i) => addDaysISO(i + 1)), []);

  const slots = useMemo(() => {
    const dayName = new Date(date).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
    const wh = branch.workingHours.find((w) => w.day === dayName);
    if (!wh || wh.closed) return [];
    const [oh, om] = wh.open.split(":").map(Number);
    const [ch, cm] = wh.close.split(":").map(Number);
    const start = oh * 60 + om;
    const end = ch * 60 + cm;
    const out: string[] = [];
    for (let m = start; m + 30 <= end; m += 30) {
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

  function submit() {
    const appt = bookAppointment({
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
          <Row label="Branch" value={BRANCH_LABELS[branchId]} />
          <Row label="Date" value={date} />
          <Row label="Time" value={formatTime(time)} />
          <Row label="Services" value={selected.length.toString()} />
          <Row label="Total" value={formatPrice(total)} />
        </Card>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/customer/bookings">My Bookings</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/customer">Home</Link>
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
              {label}
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
            <h2 className="font-semibold">Choose a branch</h2>
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
            <h2 className="font-semibold">Choose services</h2>
            {grouped.map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
                <div className="space-y-2">
                  {items.map((s) => {
                    const on = selected.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                          on ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                        )}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                          <Scissors className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.durationMin} min</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(s.price)}</p>
                          <span
                            className={cn(
                              "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                              on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                            )}
                          >
                            {on && <Check className="h-3 w-3" />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Choose a date</h2>
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
            <h2 className="font-semibold">Choose a time</h2>
            {slots.length === 0 ? (
              <p className="rounded-xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Salon is closed on this day. Please pick another date.
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
            <h2 className="font-semibold">Review &amp; confirm</h2>
            <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
              <Row label="Branch" value={BRANCH_LABELS[branchId]} />
              <Row label="Date" value={date} />
              <Row label="Time" value={formatTime(time)} />
              <Row
                label="Services"
                value={services
                  .filter((s) => selected.includes(s.id))
                  .map((s) => s.name)
                  .join(", ")}
              />
              <Row label="Duration" value={`${totalMin} min`} />
              <Row label="Total" value={formatPrice(total)} highlight />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < 4 ? (
          <Button onClick={next} disabled={!canNext} className="gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} className="gap-1">
            <CalendarPlus className="h-4 w-4" /> Book Appointment
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
