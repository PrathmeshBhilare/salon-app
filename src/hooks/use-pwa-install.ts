"use client";

import { useState, useEffect } from "react";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW registration failed", err));
    }

    // 1. Detect if the app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const hasInstalledFlag = localStorage.getItem("pwa_installed") === "true";
    
    if (isStandalone || hasInstalledFlag) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect if the device is iOS (iPhone/iPad) and using Safari
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);
    
    if (isSafari && !isStandalone) {
      setIsIOS(true);
      // We don't get beforeinstallprompt on iOS, so we just set it as installable to show manual instructions
      setIsInstallable(true);
    }

    // 3. Listen for the beforeinstallprompt event (Chrome/Android/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      localStorage.setItem("pwa_installed", "true");
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setIsInstallable(false);
    // Optionally: localStorage.setItem('pwa_dismissed', 'true');
  };

  return { isInstallable, isInstalled, isIOS, installPwa, dismissPrompt };
}
