"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, User, Phone, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, Building2, MapPin } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useData();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    preferredBranch: "lhasurane" as BranchId,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Validation on blur or submit
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.email.trim()) newErrors.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error when typing
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: "" }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    
    if (!res.ok) {
      setErrors({ form: res.error ?? "Registration failed. Please try again." });
      return;
    }
    toast.success("Account created successfully!");
  }

  // Password strength calculator (0-4)
  const getPasswordStrength = () => {
    if (!form.password) return -1;
    let score = 0;
    if (form.password.length > 5) score += 1;
    if (form.password.length > 7) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return Math.min(score, 4);
  };
  
  const strength = getPasswordStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

  const features = [
    "Book Appointments Anytime",
    "Choose Your Preferred Stylist",
    "Earn Loyalty Rewards",
    "Track Appointment Status",
    "Manage Your Visits"
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
              Premium salon experience, at your fingertips.
            </h2>
            <p className="max-w-md text-sm leading-relaxed opacity-90">
              Create an account to unlock exclusive features tailored for our valued clients.
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium opacity-90">
                <CheckCircle2 className="h-5 w-5 opacity-80" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-xs font-medium tracking-wide opacity-70">Lhasurane · Koregaon</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-8 md:py-12 md:w-7/12 lg:w-1/2">
        <div className="w-full max-w-[420px] mx-auto flex flex-col">
          
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
              Create Account
            </h1>
            <p className="text-[15px] text-muted-foreground font-medium mt-2">
              Join Glow & Glamour to get started.
            </p>
          </div>

          <form onSubmit={submit} className="w-full space-y-4" noValidate>
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={cn(
                    "h-[50px] lg:h-[54px] rounded-[14px] pl-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/50 hover:bg-background",
                    errors.fullName ? "border-rose-500 focus-visible:border-rose-500" : "border-border/80 focus-visible:border-primary"
                  )}
                />
              </div>
              {errors.fullName && <p className="text-[13px] text-rose-600 font-medium pl-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Phone className="h-5 w-5" />
                </div>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  inputMode="tel"
                  className={cn(
                    "h-[50px] lg:h-[54px] rounded-[14px] pl-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/50 hover:bg-background",
                    errors.phone ? "border-rose-500 focus-visible:border-rose-500" : "border-border/80 focus-visible:border-primary"
                  )}
                />
              </div>
              {errors.phone && <p className="text-[13px] text-rose-600 font-medium pl-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={cn(
                    "h-[50px] lg:h-[54px] rounded-[14px] pl-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/50 hover:bg-background",
                    errors.email ? "border-rose-500 focus-visible:border-rose-500" : "border-border/80 focus-visible:border-primary"
                  )}
                />
              </div>
              {errors.email && <p className="text-[13px] text-rose-600 font-medium pl-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={cn(
                    "h-[50px] lg:h-[54px] rounded-[14px] pl-11 pr-11 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/50 hover:bg-background",
                    errors.password ? "border-rose-500 focus-visible:border-rose-500" : "border-border/80 focus-visible:border-primary"
                  )}
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
              
              {/* Password Strength Indicator */}
              {form.password.length > 0 && (
                <div className="pt-2 px-1">
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted/50">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-full flex-1 transition-all duration-300",
                          strength >= idx ? strengthColors[strength] : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className={cn("text-[12px] font-medium transition-colors", strength < 2 ? "text-rose-500" : "text-muted-foreground")}>
                      {strengthLabels[strength]} password
                    </p>
                    <p className="text-[11px] text-muted-foreground">Min 6 chars</p>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-[13px] text-rose-600 font-medium pl-1">{errors.password}</p>}
            </div>

            {/* Preferred Branch */}
            <div className="pt-2 space-y-3">
              <Label className="text-sm font-medium text-foreground ml-1">Preferred Branch</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(BRANCH_LABELS) as BranchId[]).map((b) => {
                  const isSelected = form.preferredBranch === b;
                  return (
                    <button
                      type="button"
                      key={b}
                      onClick={() => set("preferredBranch", b)}
                      className={cn(
                        "relative flex flex-col items-start gap-1 rounded-[14px] border p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                          : "border-border/80 bg-background/50 hover:bg-accent/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                          {BRANCH_LABELS[b]}
                        </span>
                        <div className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        )}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {errors.form && (
              <div className="pt-2">
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {errors.form}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="h-[52px] lg:h-[56px] w-full rounded-[14px] text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-70 disabled:active:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 w-full text-center space-y-4 pb-8">
            <p className="text-[13px] text-muted-foreground leading-relaxed px-2">
              By creating an account, you agree to our{" "}
              <Link href="#" className="font-medium text-foreground hover:text-primary transition-colors hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-foreground hover:text-primary transition-colors hover:underline">
                Privacy Policy
              </Link>.
            </p>
            <div className="text-[15px] text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
                Sign in
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
