"use client";

import { useRouter } from "next/navigation";
import { Copy, LogOut, ShieldCheck } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, ROLE_LABELS } from "@/lib/types";
import { PageHeader, UserAvatar } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PasswordDialog } from "@/components/password-dialog";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileView() {
  const { currentUser, logout, getBranch } = useData();
  const router = useRouter();
  const [pwOpen, setPwOpen] = useState(false);
  if (!currentUser) return null;

  const branchId =
    currentUser.role === "customer"
      ? currentUser.preferredBranch
      : (currentUser.staffBranch ?? currentUser.ownerBranch ?? "lhasurane");
  const branch = getBranch(branchId);

  function copyId() {
    navigator.clipboard?.writeText(currentUser!.id);
    toast.success("User ID copied");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your Glow & Glamour identity." />

      <Card className="flex flex-col items-center gap-3 p-6 text-center shadow-sm">
        <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} className="h-20 w-20 text-2xl" />
        <div>
          <p className="font-display text-xl font-semibold">{currentUser.fullName}</p>
          <Badge className="mt-1 bg-primary/10 text-primary" variant="secondary">
            <ShieldCheck className="mr-1 h-3 w-3" /> {ROLE_LABELS[currentUser.role]}
          </Badge>
        </div>
        <button
          onClick={copyId}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          <span className="font-mono font-semibold tracking-wider">{currentUser.id}</span>
          <Copy className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-xs text-muted-foreground">Your permanent User ID</p>
      </Card>

      <Card className="divide-y divide-border p-0 shadow-sm">
        <Field label="Full Name" value={currentUser.fullName} />
        <Field label="Phone" value={currentUser.phone} />
        <Field label="Email" value={currentUser.email} />
        <Field label="Branch" value={branch.name} />
        <Field label="Role" value={ROLE_LABELS[currentUser.role]} />
        {currentUser.role === "staff" && currentUser.staffPosition && (
          <Field label="Position" value={currentUser.staffPosition} />
        )}
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setPwOpen(true)}>
          Change Password
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-rose-600"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
