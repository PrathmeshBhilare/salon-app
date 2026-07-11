"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { toast } from "sonner";

const DEMO = [
  { label: "Customer", id: "priya@example.com", pwd: "cust123" },
  { label: "Staff", id: "sneha@staff.com", pwd: "staff123" },
  { label: "Owner", id: "owner@glowglamour.com", pwd: "owner123" },
];

export default function LoginPage() {
  const { login } = useData();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Please enter your login and password.");
      return;
    }
    setLoading(true);
    const res = login(identifier, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    toast.success("Welcome back!");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Glow & Glamour account."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email, phone or User ID</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="space-y-2 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">Demo accounts</p>
        <div className="flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => {
                setIdentifier(d.id);
                setPassword(d.pwd);
              }}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
