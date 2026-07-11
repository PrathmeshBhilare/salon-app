"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/90 to-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 font-display text-2xl font-bold backdrop-blur">
            G
          </div>
          <div>
            <p className="font-display text-xl font-semibold">Glow &amp; Glamour</p>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Hair Studio</p>
          </div>
        </div>
        <div className="space-y-6">
          <Sparkles className="h-10 w-10 opacity-90" />
          <div className="space-y-3">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Beauty, booked beautifully.
            </h2>
            <p className="max-w-sm text-sm opacity-90">
              Two branches, live queues, and a premium salon experience for customers,
              staff, and owners — all in one elegant app.
            </p>
          </div>
        </div>
        <p className="text-xs opacity-70">Lhasurane · Koregaon</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">
            G
          </div>
          <span className="font-display text-lg font-semibold">Glow &amp; Glamour</span>
        </Link>
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
