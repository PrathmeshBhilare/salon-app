"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Scissors, Trash2 } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type Service } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ServiceDialog } from "@/components/owner/service-dialog";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OwnerServices() {
  const { currentUser, activeBranchId, services, toggleService, deleteService } = useData();
  const [branch, setBranch] = useState<BranchId | "all">(activeBranchId);
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Service | null>(null);
  if (!currentUser) return null;

  const list = useMemo(
    () => services.filter((s) => (branch === "all" ? true : s.branchId === branch)),
    [services, branch]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of list) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [list]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        subtitle="Manage services, pricing and categories per branch."
        action={
          <Button className="gap-1" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        }
      />

      <div className="flex gap-1">
        {(["all", "lhasurane", "koregaon"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBranch(b)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (branch === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")
            }
          >
            {b === "all" ? "All Branches" : BRANCH_LABELS[b]}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={Scissors} title="No services" description="Add your first service to get started." />
      ) : (
        grouped.map(([cat, items]) => (
          <Section key={cat} title={cat}>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((s) => (
                <Card key={s.id} className="flex items-center gap-3 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(s.price)} · {s.durationMin} min · {BRANCH_LABELS[s.branchId]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.active}
                      onCheckedChange={() => {
                        toggleService(s.id);
                        toast.success(s.active ? "Service disabled" : "Service enabled");
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={() => setEditing(s)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => setToDelete(s)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        ))
      )}

      <ServiceDialog
        open={adding || !!editing}
        service={editing}
        defaultBranch={branch === "all" ? activeBranchId : branch}
        onClose={() => {
          setAdding(false);
          setEditing(null);
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (toDelete) {
                  deleteService(toDelete.id);
                  toast.success("Service deleted");
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
