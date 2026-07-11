"use client";

import { useMemo, useState } from "react";
import { Search, UserCog, Users } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type BranchId } from "@/lib/types";
import { PageHeader, Section, EmptyState, UserAvatar } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConvertStaffDialog } from "@/components/owner/convert-staff-dialog";

export default function OwnerCustomers() {
  const { currentUser, activeBranchId, users, appointments } = useData();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<"all" | BranchId>("all");
  const [convertFor, setConvertFor] = useState<string | null>(null);
  if (!currentUser) return null;

  const customers = useMemo(() => {
    return users
      .filter((u) => u.role === "customer")
      .filter((u) => (branchFilter === "all" ? true : u.preferredBranch === branchFilter))
      .filter((u) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users, query, branchFilter]);

  function apptCount(id: string) {
    return appointments.filter((a) => a.customerId === id).length;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${users.filter((u) => u.role === "customer").length} customers across both branches`}
        action={<div className="hidden sm:block"><BranchSwitcher /></div>}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone or User ID"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "lhasurane", "koregaon"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBranchFilter(b)}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                (branchFilter === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")
              }
            >
              {b === "all" ? "All" : BRANCH_LABELS[b]}
            </button>
          ))}
        </div>
      </div>

      <Section>
        {customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Try a different search or filter." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">User ID</TableHead>
                  <TableHead className="hidden md:table-cell">Branch</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Bookings</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={c.fullName} color={c.avatarColor} className="h-9 w-9" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">{c.id}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{BRANCH_LABELS[c.preferredBranch]}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{apptCount(c.id)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setConvertFor(c.id)}>
                        <UserCog className="h-4 w-4" /> Make Staff
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <ConvertStaffDialog userId={convertFor} onClose={() => setConvertFor(null)} />
    </div>
  );
}
