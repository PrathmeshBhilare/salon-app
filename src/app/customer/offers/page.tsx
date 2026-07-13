"use client";

import { useState } from "react";
import { Tag, CalendarDays, Percent, ArrowRight } from "lucide-react";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { BRANCH_LABELS } from "@/lib/types";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import type { Offer } from "@/lib/types";

export default function CustomerOffers() {
  const { activeBranchId, getOffersFor } = useData();
  const { t } = useTranslation();
  const offers = getOffersFor(activeBranchId).filter((o) => o.active);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("offers.title")}
        subtitle={t("offers.subtitle", { branch: BRANCH_LABELS[activeBranchId] })}
      />
      {offers.length === 0 ? (
        <EmptyState icon={Tag} title={t("offers.no_offers")} description={t("offers.no_offers_desc")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <Card 
              key={o.id} 
              className="group relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-primary/20"
              onClick={() => setSelectedOffer(o)}
            >
              {/* Decorative background icon */}
              <div className="absolute -right-6 -top-6 text-primary/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                <Percent className="h-32 w-32" />
              </div>
              
              <div className="relative flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-primary/10">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-wide text-primary-foreground shadow-sm">
                  {o.badge}
                </span>
                <span className="text-xs font-medium text-primary/80">
                  {o.branchId === "all" ? "All branches" : BRANCH_LABELS[o.branchId as "lhasurane" | "koregaon"]}
                </span>
              </div>
              
              <div className="relative space-y-2 p-5">
                <p className="font-display text-lg font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors">
                  {o.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {o.description}
                </p>
                
                <div className="pt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                    <CalendarDays className="h-3.5 w-3.5" /> 
                    Valid till {formatDate(o.endsAt)}
                  </span>
                  <span className="flex items-center text-xs font-semibold text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Maximize Offer Modal */}
      <Dialog open={!!selectedOffer} onOpenChange={(open) => !open && setSelectedOffer(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedOffer && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {selectedOffer.badge}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl leading-tight">
                  {selectedOffer.title}
                </DialogTitle>
                <DialogDescription className="text-base text-foreground/80 leading-relaxed pt-2">
                  {selectedOffer.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="rounded-lg bg-muted/50 p-4 mt-2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid From</span>
                  <span className="font-medium">{formatDate(selectedOffer.startsAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span className="font-medium">{formatDate(selectedOffer.endsAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available at</span>
                  <span className="font-medium">
                    {selectedOffer.branchId === "all" ? "All branches" : BRANCH_LABELS[selectedOffer.branchId as "lhasurane" | "koregaon"]}
                  </span>
                </div>
                
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    * Terms & conditions apply. Cannot be clubbed with any other ongoing offers. Present this offer at the reception during billing.
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between items-center pt-2">
                <Button variant="ghost" onClick={() => setSelectedOffer(null)}>
                  Close
                </Button>
                <Button asChild className="px-6 shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/customer/book">
                    Book Now with this Offer
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
