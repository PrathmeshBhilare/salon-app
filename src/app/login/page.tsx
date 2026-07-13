"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, resetPassword } = useData();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (mode === "reset") {
      if (!identifier) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      const res = await resetPassword(identifier);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Failed to send reset email.");
        return;
      }
      setMessage("Password reset email sent! Please check your inbox.");
      return;
    }

    if (!identifier || !password) {
      setError("Please enter your login and password.");
      return;
    }
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    toast.success("Welcome back!");
  }

  const features = [
    "Online Appointment Booking",
    "Staff Management",
    "Loyalty & Membership",
    "Live Queue Tracking",
    "Billing & POS"
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel (Desktop & Tablet) */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/90 to-primary p-12 text-primary-foreground md:flex md:w-5/12 lg:w-1/2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 font-display text-2xl font-bold backdrop-blur">
            G
          </div>
          <div>
            <p className="font-display text-xl font-semibold">Glow &amp; Glamour</p>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Hair Studio</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <Sparkles className="h-10 w-10 opacity-90" />
          <div className="space-y-4">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight">
              Beauty, booked beautifully.
            </h2>
            <p className="max-w-md text-sm leading-relaxed opacity-90">
              Two branches, live queues, and a premium salon experience for customers,
              staff, and owners — all in one elegant app.
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium opacity-90">
                <CheckCircle2 className="h-4 w-4" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-xs font-medium tracking-wide opacity-70">Lhasurane · Koregaon</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-8 pb-8 md:w-7/12 lg:w-1/2">
        <div className="w-full max-w-[420px] mx-auto flex flex-col items-center md:items-start lg:items-center">
          
          {/* Mobile Logo */}
          <Link href="/" className="flex flex-col items-center gap-3 mb-6 md:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-sm">
              G
            </div>
            <div className="text-center">
              <span className="font-display text-lg font-semibold block">Glow &amp; Glamour</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hair Studio</span>
            </div>
          </Link>

          <div className="w-full text-center md:text-left lg:text-center mb-6">
            <h1 className="font-display text-[22px] md:text-[26px] lg:text-[30px] font-semibold tracking-tight text-foreground">
              {mode === "reset" ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-[16px] text-muted-foreground font-medium mt-2 whitespace-pre-line">
              {mode === "reset" 
                ? "Enter your email to receive a password reset link." 
                : "We're glad to see you again.\nSign in to continue."}
            </p>
          </div>

          <form onSubmit={submit} className="w-full space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email, phone number or User ID"
                  autoComplete="username"
                  className="h-[50px] lg:h-[54px] rounded-[14px] pl-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary border-border/80 bg-background/50 hover:bg-background"
                />
              </div>
            </div>
            
            {mode === "login" && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-[50px] lg:h-[54px] rounded-[14px] pl-11 pr-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary border-border/80 bg-background/50 hover:bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Forgot Password Link */}
                <div className="flex justify-end pt-2 pb-1">
                  <button 
                    type="button" 
                    onClick={() => setMode("reset")}
                    className="text-[14px] font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {message}
              </p>
            )}

            <div className={mode === "login" ? "pt-1" : "pt-3"}>
              <Button 
                type="submit" 
                className="h-[52px] lg:h-[56px] w-full rounded-[14px] text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-70 disabled:active:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  mode === "reset" ? "Send Reset Link" : "Sign In"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 w-full text-center text-[15px] text-muted-foreground pb-8">
            {mode === "reset" ? (
              <>
                Remember your password?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-semibold text-primary hover:underline transition-all">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
                  Create an account
                </Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
