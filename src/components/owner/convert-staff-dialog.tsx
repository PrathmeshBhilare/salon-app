"use client";

import { useEffect, useState } from "react";
import { Search, UserCog } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ConvertStaffDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const { users, services, convertToStaff, getServicesFor } = useData();
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<null | (typeof users)[number]>(null);
  const [error, setError] = useState("");
  const [branch, setBranch] = useState<BranchId>("lhasurane");
  const [position, setPosition] = useState("Stylist");
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      setSearch(userId);
      runSearch(userId);
    } else {
      setSearch("");
      setFound(null);
    }
    setError("");
    setBranch("lhasurane");
    setPosition("Stylist");
    setPicked([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function runSearch(q: string) {
    setError("");
    const u = users.find(
      (x) => x.id.toLowerCase() === q.trim().toLowerCase() && x.role === "customer"
    );
    if (!u) {
      setFound(null);
      setError("No customer found with that User ID.");
      return;
    }
    setFound(u);
    setBranch(u.preferredBranch);
  }

  function toggle(sid: string) {
    setPicked((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]));
  }

  async function activate() {
    if (!found) return;
    const res = await convertToStaff(found.id, { branch, position, services: picked });
    if (!res.ok) {
      setError(res.error ?? "Could not convert.");
      return;
    }
    toast.success(`${found.fullName} is now staff`);
    onClose();
  }

  const branchServices = getServicesFor(branch);

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" /> Convert Customer to Staff
          </DialogTitle>
          <DialogDescription>
            Enter the customer's User ID to look them up. No duplicate accounts are created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="uid">User ID</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="uid"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. GG7K4M9P2Q"
                className="pl-9 font-mono"
              />
            </div>
            <Button variant="outline" onClick={() => runSearch(search)}>
              Search
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {found && (
          <div className="space-y-4 rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={found.fullName} color={found.avatarColor} />
              <div>
                <p className="font-medium">{found.fullName}</p>
                <p className="text-xs text-muted-foreground">{found.email} · {found.phone}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Assign Branch</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["lhasurane", "koregaon"] as BranchId[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBranch(b); setPicked([]); }}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-medium transition-colors",
                      branch === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                    )}
                  >
                    {BRANCH_LABELS[b]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pos">Position</Label>
              <Input id="pos" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Senior Stylist" />
            </div>

            <div className="space-y-2">
              <Label>Services they can perform</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {branchServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      picked.includes(s.id) ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                    )}
                  >
                    {s.name}
                    {picked.includes(s.id) && <span className="text-primary">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!found} onClick={activate}>
            Activate as Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
