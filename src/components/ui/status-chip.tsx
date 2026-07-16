import { AppointmentStatus, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium border";

  const colorStyles: Record<AppointmentStatus, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    checked_in: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    in_service: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    no_show: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

  return (
    <span className={cn(baseStyles, colorStyles[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
