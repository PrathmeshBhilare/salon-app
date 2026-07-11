"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function BranchSwitcher({
  className,
  align = "start",
}: {
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const { branches, activeBranchId, setActiveBranch } = useData();
  const [open, setOpen] = useState(false);
  const current = branches.find((b) => b.id === activeBranchId)!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between gap-2 font-normal", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate font-medium">{current.name}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[var(--radix-popover-trigger-width)] min-w-56 p-1">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setActiveBranch(b.id as BranchId);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              b.id === activeBranchId && "bg-accent"
            )}
          >
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {BRANCH_LABELS[b.id]}
            </span>
            {b.id === activeBranchId && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
