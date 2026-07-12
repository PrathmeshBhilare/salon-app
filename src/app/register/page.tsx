"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useData();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    preferredBranch: "lhasurane" as BranchId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Registration failed.");
      return;
    }
    toast.success("Account created!");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Glow & Glamour — every new account starts as a Customer."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Priya Sharma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 90000 00000" inputMode="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <Label>Preferred Branch</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BRANCH_LABELS) as BranchId[]).map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => set("preferredBranch", b)}
                className={
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors " +
                  (form.preferredBranch === b
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent")
                }
              >
                {BRANCH_LABELS[b]}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By registering you agree to our salon terms. A unique User ID will be assigned to you.
        </p>
      </form>
    </AuthShell>
  );
}
