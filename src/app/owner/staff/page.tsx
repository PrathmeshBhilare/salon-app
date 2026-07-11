"use client";

import { useState } from "react";
import { Eye, UserCog, UserMinus, UserPlus } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, Section, EmptyState, UserAvatar } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function OwnerStaff() {
  const { currentUser, users, getServicesFor, toggleStaffActive } = useData();
  const [view, setView] = useState<string | null>(null);
  if (!currentUser) return null;

  const staff = users.filter((u) => u.role === "staff");

  const detail = staff.find((s) => s.id === view);
  const detailServices = detail?.staffBranch ? getServicesFor(detail.staffBranch) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle={`${staff.filter((s) => s.active).length} active · ${staff.length} total`}
      />

      <Section>
        {staff.length === 0 ? (
          <EmptyState icon={UserCog} title="No staff yet" description="Convert a customer into staff from the Customers page." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <Card key={s.id} className="space-y-3 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserAvatar name={s.fullName} color={s.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.staffPosition}</p>
                  </div>
                  <Badge variant={s.active ? "default" : "secondary"} className={s.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : ""}>
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.staffBranch ? BRANCH_LABELS[s.staffBranch] : "—"}</span>
                  <span className="font-mono">{s.id}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setView(s.id)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => {
                      toggleStaffActive(s.id);
                      toast.success(s.active ? "Staff deactivated" : "Staff activated");
                    }}
                  >
                    {s.active ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {s.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Staff Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={detail.fullName} color={detail.avatarColor} className="h-14 w-14 text-lg" />
                  <div>
                    <p className="font-display text-lg font-semibold">{detail.fullName}</p>
                    <p className="text-sm text-muted-foreground">{detail.staffPosition}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-sm">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="text-right font-mono">{detail.id}</span>
                  <span className="text-muted-foreground">Branch</span>
                  <span className="text-right">{detail.staffBranch ? BRANCH_LABELS[detail.staffBranch] : "—"}</span>
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-right">{detail.phone}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-right">{detail.email}</span>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium">Assigned Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.staffServices && detail.staffServices.length > 0 ? (
                      detail.staffServices.map((id) => {
                        const svc = detailServices.find((x) => x.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {svc?.name ?? "Service"}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">None assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
