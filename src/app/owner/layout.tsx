import { AppShell } from "@/components/shell/app-shell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
