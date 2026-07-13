"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, Clock, LogOut, Moon, Sun, Pencil } from "lucide-react";
import { EditBranchDialog } from "./edit-branch-dialog";
import { EditWorkingHoursDialog } from "./edit-working-hours-dialog";
import { useData } from "@/lib/store";
import { useTheme } from "next-themes";
import { BRANCH_LABELS, type Branch } from "@/lib/types";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordDialog } from "@/components/password-dialog";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { settingsService } from "@/lib/services/settingsService";

export default function OwnerSettings() {
  const { currentUser, logout, branches } = useData();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [pwOpen, setPwOpen] = useState(false);
  const [editingBranchInfo, setEditingBranchInfo] = useState<Branch | null>(null);
  const [editingWorkingHours, setEditingWorkingHours] = useState<Branch | null>(null);
  const [rules, setRules] = useState({
    autoConfirm: false,
    allowWalkIn: true,
    reminders: true,
    weekendOnlyOffer: false,
  });
  const [prefs, setPrefs] = useState({ booking: true, offers: true, announcements: true });
  if (!currentUser) return null;

  useEffect(() => {
    settingsService.get().then((s) => {
      setRules({
        autoConfirm: s.autoConfirm,
        allowWalkIn: s.allowWalkIn,
        reminders: s.reminders,
        weekendOnlyOffer: s.weekendOnlyOffer,
      });
      setPrefs({
        booking: s.notifyBooking,
        offers: s.notifyOffers,
        announcements: s.notifyAnnouncements,
      });
    });
  }, []);

  const updateRule = (key: keyof typeof rules, v: boolean) => {
    setRules((r) => ({ ...r, [key]: v }));
    settingsService.save({ [key]: v } as never);
  };
  const updatePref = (key: keyof typeof prefs, v: boolean) => {
    setPrefs((p) => ({ ...p, [key]: v }));
    const map = { booking: "notifyBooking", offers: "notifyOffers", announcements: "notifyAnnouncements" } as const;
    settingsService.save({ [map[key]]: v } as never);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage salon information and policies." />

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </div>
          <p className="font-medium">Appearance</p>
          <div className="ml-auto flex gap-1 rounded-full bg-muted p-1">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                  theme === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Building2 className="h-5 w-5" />
          </div>
          <p className="font-medium">Branch Information</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((b) => (
            <div key={b.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{b.name}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingBranchInfo(b)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", b.isOpen ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300")}>
                  {b.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{b.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.phone}</p>
              <p className="mt-2 text-xs font-medium">{b.totalChairs} chairs · {b.availableChairs} available</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Clock className="h-5 w-5" />
          </div>
          <p className="font-medium">Working Hours</p>
        </div>
        {branches.map((b) => (
          <div key={b.id} className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{b.name}</p>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingWorkingHours(b)}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
              {b.workingHours.map((w) => (
                <div key={w.day} className="flex justify-between">
                  <span className="text-muted-foreground">{w.day}</span>
                  <span>{w.closed ? "Closed" : `${formatTime(w.open)}–${formatTime(w.close)}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Clock className="h-5 w-5" />
          </div>
          <p className="font-medium">Booking Rules</p>
        </div>
        {[
          { key: "autoConfirm", label: "Auto-confirm bookings", desc: "Skip manual confirmation" },
          { key: "allowWalkIn", label: "Allow walk-in queue", desc: "Customers can join without booking" },
          { key: "reminders", label: "Send appointment reminders", desc: "Notify before scheduled time" },
          { key: "weekendOnlyOffer", label: "Offers weekend-only", desc: "Restrict promotions to weekends" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 first:border-0 first:pt-0">
            <div>
              <Label className="font-medium">{row.label}</Label>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
            <Switch
              checked={rules[row.key as keyof typeof rules]}
              onCheckedChange={(v) => updateRule(row.key as keyof typeof rules, v)}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Bell className="h-5 w-5" />
          </div>
          <p className="font-medium">Notifications</p>
        </div>
        {[
          { key: "booking", label: "New booking alerts" },
          { key: "offers", label: "Offer publishing" },
          { key: "announcements", label: "Staff announcements" },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 first:border-0 first:pt-0">
            <Label className="font-medium">{row.label}</Label>
            <Switch
              checked={prefs[row.key as keyof typeof prefs]}
              onCheckedChange={(v) => updatePref(row.key as keyof typeof prefs, v)}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-5 shadow-sm">
        <p className="font-medium">Account</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>
          Change Password
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-rose-600"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </Card>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />

      <EditBranchDialog 
        branch={editingBranchInfo} 
        open={!!editingBranchInfo} 
        onOpenChange={(open) => !open && setEditingBranchInfo(null)} 
      />
      <EditWorkingHoursDialog 
        branch={editingWorkingHours} 
        open={!!editingWorkingHours} 
        onOpenChange={(open) => !open && setEditingWorkingHours(null)} 
      />
    </div>
  );
}
