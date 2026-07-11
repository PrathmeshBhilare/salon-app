"use client";

import { Tag } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";

export default function CustomerOffers() {
  const { activeBranchId, getOffersFor } = useData();
  const offers = getOffersFor(activeBranchId).filter((o) => o.active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        subtitle={`Exclusive deals at ${BRANCH_LABELS[activeBranchId]}`}
      />
      {offers.length === 0 ? (
        <EmptyState icon={Tag} title="No active offers" description="Check back soon for new deals." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <Card key={o.id} className="overflow-hidden shadow-sm">
              <div className="flex items-center justify-between bg-primary/10 px-4 py-3">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {o.badge}
                </span>
                <span className="text-xs text-muted-foreground">
                  {o.branchId === "all" ? "All branches" : BRANCH_LABELS[o.branchId as "lhasurane" | "koregaon"]}
                </span>
              </div>
              <div className="space-y-1 p-4">
                <p className="font-display text-lg font-semibold">{o.title}</p>
                <p className="text-sm text-muted-foreground">{o.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
