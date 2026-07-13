"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { STATUS_LABELS } from "@/lib/types";
import type { AppointmentStatus } from "@/lib/types";
import { initials } from "@/lib/format";
import { statusColor } from "@/lib/format";
import { useData } from "@/lib/store";

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: accent ?? "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { currentUser } = useData();
  let label = STATUS_LABELS[status];
  
  if (currentUser?.role === "customer") {
    if (status === "cancelled") label = "Cancelled by You";
    if (status === "rejected") label = "Cancelled by Salon";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusColor(status)
      )}
    >
      {label}
    </span>
  );
}

export function UserAvatar({
  name,
  color = "#b08d57",
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-9 w-9", className)}>
      <AvatarFallback style={{ background: color, color: "#fff" }} className="font-semibold">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function SkeletonCard() {
  return (
    <Card className="animate-shimmer relative overflow-hidden p-4">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-3 h-7 w-1/2 rounded bg-muted" />
    </Card>
  );
}
