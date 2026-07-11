"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, MonitorDot, X } from "lucide-react";
import { useData } from "@/lib/store";
import { NAV, ROLE_TAGLINE } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui-kit";
import { BranchSwitcher } from "./branch-switcher";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, unreadCount } = useData();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;
  const role = currentUser.role;
  const items = NAV[role];

  const unread = unreadCount(currentUser);

  function isActive(href: string) {
    if (href === `/${role}`) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <div className="flex h-16 items-center gap-2 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              G
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">Glow &amp; Glamour</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hair Studio</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            {items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-primary")} />
                  {item.label}
                  {item.badge === "notifications" && unread > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 justify-center bg-primary px-1.5 text-[10px] text-primary-foreground">
                      {unread}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            {(role === "staff" || role === "owner") && (
              <Button
                variant="outline"
                className="mb-2 w-full justify-start gap-2"
                onClick={() => router.push(`/${role}-reception`)}
              >
                <MonitorDot className="h-4 w-4 text-primary" /> Reception Mode
              </Button>
            )}
            <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-2.5">
              <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{currentUser.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">ID: {currentUser.id}</p>
              </div>
              <button
                onClick={logout}
                aria-label="Logout"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
          G
        </div>
        <span className="font-display text-sm font-semibold">Glow &amp; Glamour</span>
        <div className="ml-auto flex items-center gap-1">
          <BranchSwitcher className="h-9 border-none px-2 shadow-none" />
          <Link href={`/${role}/notifications`} aria-label="Notifications" className="relative rounded-full p-2">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
            <div className="flex h-16 items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                  G
                </div>
                <div className="leading-tight">
                  <p className="font-display text-sm font-semibold">Glow &amp; Glamour</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Hair Studio</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
              {items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "text-primary")} />
                    {item.label}
                    {item.badge === "notifications" && unread > 0 && (
                      <Badge className="ml-auto h-5 min-w-5 justify-center bg-primary px-1.5 text-[10px] text-primary-foreground">
                        {unread}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-3">
              {(role === "staff" || role === "owner") && (
                <Button
                  variant="outline"
                  className="mb-2 w-full justify-start gap-2"
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(`/${role}-reception`);
                  }}
                >
                  <MonitorDot className="h-4 w-4 text-primary" /> Reception Mode
                </Button>
              )}
              <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-2.5">
                <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-medium">{currentUser.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">ID: {currentUser.id}</p>
                </div>
                <button
                  onClick={logout}
                  aria-label="Logout"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main
        className={cn(
          "mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 md:pl-72 md:pr-6",
          isMobile && "pb-24"
        )}
      >
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      {isMobile && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-background/95 backdrop-blur md:hidden">
          {items.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge === "notifications" && unread > 0 && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </span>
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
