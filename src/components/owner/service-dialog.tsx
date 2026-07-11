"use client";

import { useEffect, useState } from "react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type Service } from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ServiceDialog({
  open,
  service,
  defaultBranch,
  onClose,
}: {
  open: boolean;
  service: Service | null;
  defaultBranch: BranchId;
  onClose: () => void;
}) {
  const { addService, updateService, services } = useData();
  const [branchId, setBranchId] = useState<BranchId>(defaultBranch);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  const categories = Array.from(new Set(services.map((s) => s.category))).sort();

  useEffect(() => {
    if (service) {
      setBranchId(service.branchId);
      setCategory(service.category);
      setName(service.name);
      setPrice(String(service.price));
      setDuration(String(service.durationMin));
      setActive(service.active);
    } else {
      setBranchId(defaultBranch);
      setCategory("");
      setName("");
      setPrice("");
      setDuration("");
      setActive(true);
    }
    setError("");
  }, [service, defaultBranch, open]);

  function save() {
    setError("");
    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    const priceNum = Number(price);
    const durNum = Number(duration);
    if (!priceNum || priceNum <= 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!durNum || durNum <= 0) {
      setError("Enter a valid duration in minutes.");
      return;
    }
    const payload = {
      branchId,
      category: category.trim(),
      name: name.trim(),
      price: priceNum,
      durationMin: durNum,
      active,
    };
    if (service) {
      updateService(service.id, payload);
      toast.success("Service updated");
    } else {
      addService(payload);
      toast.success("Service added");
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>Categories are free-form — type a new one any time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["lhasurane", "koregaon"] as BranchId[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBranchId(b)}
                  className={
                    "rounded-xl border py-2 text-sm font-medium transition-colors " +
                    (branchId === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")
                  }
                >
                  {BRANCH_LABELS[b]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat">Category</Label>
            <Input
              id="cat"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Haircuts"
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Styling Cut" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dur">Duration (min)</Label>
              <Input id="dur" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label className="font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">Visible to customers for booking</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{service ? "Save Changes" : "Add Service"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
