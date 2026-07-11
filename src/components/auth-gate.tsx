"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useData } from "@/lib/store";

const AUTH_ROUTES = ["/login", "/register"];

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="font-display text-2xl font-semibold tracking-tight text-primary"
      >
        Glow &amp; Glamour
      </motion.div>
      <div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-muted">
        <div className="animate-shimmer absolute inset-0 rounded-full bg-primary/40" />
      </div>
      <p className="text-xs text-muted-foreground">Preparing your salon experience…</p>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, currentUser } = useData();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtected = pathname.startsWith("/customer") || pathname.startsWith("/staff") || pathname.startsWith("/owner");

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && isProtected) {
      router.replace("/login");
    } else if (currentUser && (isAuthRoute || pathname === "/")) {
      router.replace(`/${currentUser.role}`);
    }
  }, [ready, currentUser, isProtected, isAuthRoute, pathname, router]);

  if (!ready) return <Splash />;

  if (!currentUser && isProtected) return <Splash />;
  if (currentUser && (isAuthRoute || pathname === "/")) return <Splash />;

  const themeClass = currentUser ? `theme-${currentUser.role}` : "theme-customer";

  return <div className={themeClass}>{children}</div>;
}
