"use client";

import { useMemo, useState, useEffect } from "react";
import { serviceService } from "@/lib/services/serviceService";
import { Pencil, Plus, Scissors, Trash2, Search } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId, type Service } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  useEffect(() => {
    serviceService.cleanupDuplicates();
  }, []);

  if (!currentUser) return null;

  const list = useMemo(() => {
    return services.filter((s) => {
      const branchMatch = branch === "all" ? true : s.branchId === branch;
      const searchMatch = searchQuery.trim() === "" || s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return branchMatch && searchMatch;
    });
  }, [services, branch, searchQuery]);

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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(["all", "lhasurane", "koregaon"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
                (branch === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")
              }
            >
              {b === "all" ? "All Branches" : BRANCH_LABELS[b]}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card rounded-full"
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={Scissors} title="No services found" description="Adjust your filters or add a new service to get started." />
      ) : (
        <Accordion type="multiple" defaultValue={grouped.map((g) => g[0])} className="w-full space-y-4">
          {grouped.map(([cat, items]) => (
            <AccordionItem key={cat} value={cat} className="rounded-xl border border-border bg-card overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 data-[state=open]:border-b border-border transition-colors">
                <span className="font-semibold text-lg">{cat}</span>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="flex flex-col divide-y divide-border">
                  {items.map((s) => (
                    <div key={s.id} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 px-5 hover:bg-muted/10 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-base leading-tight">{s.name}</p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                          <span className="font-medium text-foreground">{formatPrice(s.price)}</span> 
                          <span className="opacity-40">•</span> 
                          <span>{s.durationMin} min</span> 
                          <span className="opacity-40">•</span> 
                          <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{BRANCH_LABELS[s.branchId]}</Badge>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Switch
                          checked={s.active}
                          onCheckedChange={() => {
                            toggleService(s.id);
                            toast.success(s.active ? "Service disabled" : "Service enabled");
                          }}
                        />
                        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditing(s)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-rose-600" onClick={() => setToDelete(s)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
