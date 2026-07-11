"use client";

import { useState } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { OfferDialog } from "@/components/owner/offer-dialog";
import { formatDate } from "@/lib/format";
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
import type { Offer } from "@/lib/types";

export default function OwnerOffers() {
  const { currentUser, offers, toggleOffer, deleteOffer } = useData();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [toDelete, setToDelete] = useState<Offer | null>(null);
  if (!currentUser) return null;

  const sorted = [...offers].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        subtitle="Create branch-specific or salon-wide promotions."
        action={
          <Button className="gap-1" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> New Offer
          </Button>
        }
      />

      <Section>
        {sorted.length === 0 ? (
          <EmptyState icon={Tag} title="No offers" description="Create your first promotion." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((o) => (
              <Card key={o.id} className="overflow-hidden shadow-sm">
                <div className="flex items-center justify-between bg-primary/10 px-4 py-2">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {o.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {o.branchId === "all" ? "All branches" : BRANCH_LABELS[o.branchId]}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.title}</p>
                      <p className="text-sm text-muted-foreground">{o.description}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.startsAt)} – {formatDate(o.endsAt)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={o.active}
                        onCheckedChange={() => {
                          toggleOffer(o.id);
                          toast.success(o.active ? "Offer deactivated" : "Offer activated");
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{o.active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(o)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => setToDelete(o)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <OfferDialog
        open={adding || !!editing}
        offer={editing}
        onClose={() => {
          setAdding(false);
          setEditing(null);
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete offer?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.title} will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (toDelete) {
                  deleteOffer(toDelete.id);
                  toast.success("Offer deleted");
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
