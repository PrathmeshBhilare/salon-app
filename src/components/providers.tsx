"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { DataProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import { AuthGate } from "@/components/auth-gate";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <DataProvider>
          <AuthGate>{children}</AuthGate>
          <Toaster position="top-center" richColors closeButton />
        </DataProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
