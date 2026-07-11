"use client";

import { useRouter } from "next/navigation";
import { ReceptionMode } from "@/components/shell/reception-mode";

export default function StaffReceptionPage() {
  const router = useRouter();
  return <ReceptionMode onExit={() => router.push("/staff")} />;
}
