"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Languages, LogOut, Moon, Sun, Bell } from "lucide-react";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordDialog } from "@/components/password-dialog";
import { cn } from "@/lib/utils";

export function SettingsView({ showLanguage = true }: { showLanguage?: boolean }) {
  const { logout } = useData();
  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [pwOpen, setPwOpen] = useState(false);
  const [prefs, setPrefs] = useState({ booking: true, offers: true, reminders: true });

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium">{t("settings.appearance")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.theme")}</p>
            </div>
          </div>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {(["light", "dark"] as const).map((tVal) => (
              <button
                key={tVal}
                onClick={() => setTheme(tVal)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                  theme === tVal ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {tVal}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {showLanguage && (
        <Card className="space-y-3 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Languages className="h-5 w-5" />
            </div>
            <p className="font-medium">{t("settings.language")}</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: "en", label: "English" },
              { id: "hi", label: "हिन्दी" },
              { id: "mr", label: "मराठी" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id as "en" | "hi" | "mr")}
                className={cn(
                  "flex-1 rounded-xl border py-2 text-sm font-medium transition-colors",
                  language === l.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-4 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Bell className="h-5 w-5" />
          </div>
          <p className="font-medium">{t("settings.notifications")}</p>
        </div>
        {[
          { key: "booking", label: t("settings.booking_updates"), desc: t("settings.booking_updates_desc") },
          { key: "offers", label: t("settings.offers"), desc: t("settings.offers_desc") },
          { key: "reminders", label: t("settings.reminders"), desc: t("settings.reminders_desc") },
        ].map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 first:border-0 first:pt-0">
            <div>
              <Label className="font-medium">{row.label}</Label>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
            <Switch
              checked={prefs[row.key as keyof typeof prefs]}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-5 shadow-sm">
        <p className="font-medium">{t("settings.account")}</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>
          {t("settings.change_password")}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-rose-600"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> {t("settings.logout")}
        </Button>
      </Card>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}
