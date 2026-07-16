"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Search, SlidersHorizontal } from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type AppointmentStatus, type Appointment } from "@/lib/types";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { todayISO } from "@/lib/format";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { CompactAppointmentCard } from "./components/compact-appointment-card";
import { AppointmentDetailPanel } from "./components/appointment-detail-panel";
import { ReceptionMode } from "@/components/shell/reception-mode";

type TimeGroup = "Morning" | "Afternoon" | "Evening";

function getTimeGroup(timeStr: string): TimeGroup {
  // Assuming time format like "10:30 AM" or "02:00 PM"
  const isPM = timeStr.toLowerCase().includes("pm");
  const [hourStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function OwnerAppointmentsContent() {
  const searchParams = useSearchParams();
  const { currentUser, activeBranchId, appointments, services } = useData();
  const [tab, setTab] = useState("all");
  const [filterDate, setFilterDate] = useState<string>(searchParams.get("date") || todayISO());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [isReception, setIsReception] = useState(false);

  if (!currentUser) return null;

  if (isReception) {
    return <ReceptionMode onExit={() => setIsReception(false)} />;
  }

  // 1. Filter by branch and date
  const baseList = useMemo(() => {
    return appointments
      .filter((a) => a.branchId === activeBranchId)
      .filter((a) => (filterDate ? a.date === filterDate : true));
  }, [appointments, activeBranchId, filterDate]);

  // 2. Compute tab counts based on baseList
  const counts = useMemo(() => {
    return {
      all: baseList.length,
      pending: baseList.filter(a => a.status === "pending").length,
      confirmed: baseList.filter(a => a.status === "confirmed").length,
      checked_in: baseList.filter(a => a.status === "checked_in").length,
      in_service: baseList.filter(a => a.status === "in_service").length,
      completed: baseList.filter(a => a.status === "completed").length,
      cancelled: baseList.filter(a => ["cancelled", "rejected", "no_show"].includes(a.status)).length,
    };
  }, [baseList]);

  // 3. Apply Tab filter & Search filter
  const filteredList = useMemo(() => {
    return baseList
      .filter((a) => {
        if (tab === "all") return true;
        if (tab === "cancelled") return ["cancelled", "rejected", "no_show"].includes(a.status);
        return a.status === (tab as AppointmentStatus);
      })
      .filter(a => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        
        // Search by name, phone, token, id
        if (a.customerName.toLowerCase().includes(q)) return true;
        if (a.customerPhone?.toLowerCase().includes(q)) return true;
        if (a.token?.toString().includes(q)) return true;
        if (a.id.toLowerCase().includes(q)) return true;
        if (a.customerUid?.toLowerCase().includes(q)) return true;
        
        // Search by service name
        const hasService = a.serviceIds.some(sId => {
          const s = services.find(x => x.id === sId);
          return s && s.name.toLowerCase().includes(q);
        });
        if (hasService) return true;

        return false;
      })
      .sort((a, b) => {
        // Sort by time roughly (assuming HH:mm AM/PM)
        const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
        return timeA - timeB;
      });
  }, [baseList, tab, searchQuery, services]);

  // 4. Group by Time
  const groupedList = useMemo(() => {
    const groups: Record<TimeGroup, Appointment[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };
    filteredList.forEach(a => {
      groups[getTimeGroup(a.time)].push(a);
    });
    return groups;
  }, [filteredList]);

  const selectedAppt = appointments.find(a => a.id === selectedApptId);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col sm:h-[calc(100vh-theme(spacing.24))] lg:h-auto overflow-hidden lg:overflow-visible">
      {/* Header Area */}
      <div className="space-y-4 shrink-0 pb-4">
        <PageHeader
          title="Appointments"
          subtitle={`Selected Branch • ${new Date(filterDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`}
          action={
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsReception(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-10 px-4 rounded-xl">
                <SlidersHorizontal className="h-4 w-4" /> Live Reception
              </Button>
              <div className="hidden sm:block"><BranchSwitcher /></div>
            </div>
          }
        />
        
        {/* Filters Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card p-2 rounded-xl border shadow-sm">
          <Tabs value={tab} onValueChange={setTab} className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 p-1 bg-transparent">
              <TabsTrigger value="all" className="rounded-full text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-full text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/30">Pending ({counts.pending})</TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-full text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/30">Confirmed ({counts.confirmed})</TabsTrigger>
              <TabsTrigger value="checked_in" className="rounded-full text-xs data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800 dark:data-[state=active]:bg-teal-900/30">Checked In ({counts.checked_in})</TabsTrigger>
              <TabsTrigger value="in_service" className="rounded-full text-xs data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-900/30">In Service ({counts.in_service})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/30">Completed ({counts.completed})</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-full text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900/30">Cancelled ({counts.cancelled})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 px-1">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-full bg-background"
              />
            </div>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[140px] h-9 rounded-full bg-background"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 gap-6">
        
        {/* Left Side: Master List */}
        <div className="flex-1 min-w-0 flex flex-col bg-background/50 rounded-xl border overflow-hidden">
          {/* Summary Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
            <span className="text-sm font-medium text-muted-foreground">
              {filteredList.length} Appointments Found
            </span>
          </div>

          <ScrollArea className="flex-1 p-4">
            {filteredList.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No appointments" description="No appointments match your filters." />
            ) : (
              <div className="space-y-6 pb-20 lg:pb-4">
                {(["Morning", "Afternoon", "Evening"] as TimeGroup[]).map((timeGroup) => {
                  const groupAppointments = groupedList[timeGroup];
                  if (groupAppointments.length === 0) return null;
                  return (
                    <div key={timeGroup}>
                      <h3 className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 text-sm font-semibold text-muted-foreground">
                        {timeGroup}
                      </h3>
                      <div className="grid gap-3 mt-2">
                        {groupAppointments.map((a) => (
                          <CompactAppointmentCard
                            key={a.id}
                            appointment={a}
                            services={services}
                            isSelected={selectedApptId === a.id}
                            onClick={() => setSelectedApptId(a.id)}
                            onViewHistory={() => setSelectedApptId(a.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Side: Detail Panel (Desktop only) */}
        <div className="hidden lg:block w-[400px] xl:w-[450px] shrink-0 border rounded-xl overflow-hidden shadow-sm">
          {selectedAppt ? (
            <AppointmentDetailPanel 
              appointment={selectedAppt}
              services={services}
              allAppointments={appointments}
              onClose={() => setSelectedApptId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-8 text-center">
              <CalendarCheck className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium text-lg">Select an appointment</p>
              <p className="text-sm mt-1">Choose an appointment from the list to view its complete details and history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Detail Panel */}
      <Sheet open={!!selectedApptId && window.innerWidth < 1024} onOpenChange={(open) => !open && setSelectedApptId(null)}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-xl sm:max-w-none">
          {selectedAppt && (
            <AppointmentDetailPanel 
              appointment={selectedAppt}
              services={services}
              allAppointments={appointments}
              onClose={() => setSelectedApptId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function OwnerAppointments() {
  return (
    <Suspense fallback={null}>
      <OwnerAppointmentsContent />
    </Suspense>
  );
}
