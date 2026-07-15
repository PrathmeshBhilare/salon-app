"use client";

import { useEffect, useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function PwaInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, installPwa, dismissPrompt } = usePwaInstall();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Don't show immediately on first load, wait a few seconds so it's not jarring
    const dismissedFlag = localStorage.getItem("pwa_dismissed");
    if (dismissedFlag === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    dismissPrompt();
    localStorage.setItem("pwa_dismissed", "true");
  };

  if (!mounted || !isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-border rounded-xl shadow-lg p-5 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4 pr-6">
        <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="font-semibold text-lg leading-none tracking-tight mb-1">Install App</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Install this app for a faster, offline-capable experience.
          </p>

          {isIOS ? (
            <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-center gap-2 border border-border">
              <span className="flex items-center gap-1">Tap <Share className="w-4 h-4" /></span>
              <span>then</span>
              <span className="flex items-center gap-1"><PlusSquare className="w-4 h-4" /> Add to Home Screen</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={installPwa}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Install App
              </button>
              <button 
                onClick={handleDismiss}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
