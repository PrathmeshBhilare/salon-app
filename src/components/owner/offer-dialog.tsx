"use client";

import { useEffect, useState } from "react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type Offer } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { addDaysISO } from "@/lib/format";
import { toast } from "sonner";

export function OfferDialog({
  open,
  offer,
  onClose,
}: {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
}) {
  const { addOffer, updateOffer } = useData();
  const [branchId, setBranchId] = useState<BranchId | "all">("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (offer) {
      setBranchId(offer.branchId);
      setTitle(offer.title);
      setDescription(offer.description);
      setBadge(offer.badge);
      setStartsAt(offer.startsAt);
      setEndsAt(offer.endsAt);
      setActive(offer.active);
    } else {
      setBranchId("all");
      setTitle("");
      setDescription("");
      setBadge("");
      setStartsAt(new Date().toISOString().slice(0, 10));
      setEndsAt(addDaysISO(30));
      setActive(true);
    }
    setError("");
  }, [offer, open]);

  function save() {
    setError("");
    if (!title.trim() || !badge.trim()) {
      setError("Title and badge are required.");
      return;
    }
    const payload = {
      branchId,
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim(),
      active,
      startsAt,
      endsAt,
    };
    if (offer) {
      updateOffer(offer.id, payload);
      toast.success("Offer updated");
    } else {
      addOffer(payload);
      toast.success("Offer created");
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{offer ? "Edit Offer" : "New Offer"}</DialogTitle>
          <DialogDescription>Pick a branch or apply salon-wide.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Applies To</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["all", "lhasurane", "koregaon"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBranchId(b)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-medium transition-colors",
                    branchId === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                  )}
                >
                  {b === "all" ? "All" : BRANCH_LABELS[b]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otitle">Title</Label>
            <Input id="otitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monday Glow Deal" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obadge">Badge</Label>
            <Input id="obadge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. 20% OFF" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="odesc">Description</Label>
            <Textarea id="odesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the offer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start">Starts</Label>
              <Input id="start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Ends</Label>
              <Input id="end" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label className="font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">Show to customers now</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{offer ? "Save Changes" : "Create Offer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
