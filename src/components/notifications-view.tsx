"use client";

import { Bell, CalendarCheck, Info, Megaphone, Ticket, X, CheckCheck, Trash2 } from "lucide-react";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

const ICONS = {
  booking: CalendarCheck,
  cancel: X,
  reminder: Bell,
  announcement: Megaphone,
  system: Info,
  queue: Ticket,
} as const;

export function NotificationsView() {
  const { currentUser, notificationsFor, unreadCount, markNotificationRead, markAllNotificationsRead, clearAllNotifications, deleteNotification } = useData();
  const { t } = useTranslation();
  if (!currentUser) return null;
  const list = notificationsFor(currentUser);
  const unread = unreadCount(currentUser);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notifications.title")}
        subtitle={unread > 0 ? `${unread} ${t("notifications.unread")}` : t("notifications.caught_up")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {unread > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead()}>
                <CheckCheck className="mr-2 h-4 w-4" /> {t("notifications.mark_all")}
              </Button>
            )}
            {list.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => clearAllNotifications()}>
                <X className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )}
          </div>
        }
      />
      {list.length === 0 ? (
        <EmptyState icon={Bell} title={t("notifications.empty")} description={t("notifications.empty_desc")} />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <NotificationRow 
              key={n.id} 
              n={n} 
              onClick={() => markNotificationRead(n.id)} 
              onDelete={() => deleteNotification(n.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onClick, onDelete }: { n: AppNotification; onClick: () => void; onDelete: () => void }) {
  const Icon = ICONS[n.kind] ?? Bell;
  return (
    <Card className={cn("group flex items-start gap-3 p-4 shadow-sm transition-colors hover:bg-accent/50 cursor-pointer", !n.read && "border-primary/30 bg-primary/5")} onClick={onClick}>
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          !n.read ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{n.title}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{relativeTime(n.createdAt)}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 text-muted-foreground hover:bg-rose-100 hover:text-rose-600 transition-colors shrink-0 self-center"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </Card>
  );
}
