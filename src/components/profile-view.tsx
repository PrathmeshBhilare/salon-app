"use client";

import { useRouter } from "next/navigation";
import { Copy, LogOut, ShieldCheck, Edit2, Check, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, ROLE_LABELS } from "@/lib/types";
import { PageHeader, UserAvatar } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordDialog } from "@/components/password-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/services/userService";

export function ProfileView() {
  const { currentUser, logout, getBranch } = useData();
  const { t } = useTranslation();
  const router = useRouter();
  const [pwOpen, setPwOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", address: "" });

  if (!currentUser) return null;

  const branchId =
    currentUser.role === "customer"
      ? currentUser.preferredBranch
      : (currentUser.staffBranch ?? currentUser.ownerBranch ?? "lhasurane");
  const branch = getBranch(branchId);

  function copyId() {
    navigator.clipboard?.writeText(currentUser!.id);
    toast.success(t("profile.id_copied"));
  }

  function handleEdit() {
    setFormData({
      fullName: currentUser!.fullName || "",
      phone: currentUser!.phone || "",
      address: currentUser!.address || "",
    });
    setIsEditing(true);
  }

  async function handleSave() {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error(t("profile.required_fields"));
      return;
    }
    setSaving(true);
    try {
      await userService.updateUserByUid(currentUser!.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success(t("profile.updated"));
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || t("profile.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("profile.title")} 
        subtitle={t("profile.subtitle")} 
        action={
          !isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-9 gap-2">
              <Edit2 className="h-4 w-4" /> {t("common.edit")}
            </Button>
          )
        }
      />

      <Card className="flex flex-col items-center gap-3 p-6 text-center shadow-sm">
        <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} className="h-20 w-20 text-2xl" />
        <div>
          <p className="font-display text-xl font-semibold">{currentUser.fullName}</p>
          <Badge className="mt-1 bg-primary/10 text-primary" variant="secondary">
            <ShieldCheck className="mr-1 h-3 w-3" /> {ROLE_LABELS[currentUser.role]}
          </Badge>
        </div>
        <button
          onClick={copyId}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          <span className="font-mono font-semibold tracking-wider">{currentUser.id}</span>
          <Copy className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-xs text-muted-foreground">{t("profile.permanent_id")}</p>
      </Card>

      <Card className="divide-y divide-border p-0 shadow-sm overflow-hidden">
        {isEditing ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("profile.full_name")}</label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                placeholder={t("profile.full_name")} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("profile.phone")}</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder={t("profile.phone")} 
              />
            </div>
            <div className="space-y-1.5 opacity-70">
              <label className="text-sm font-medium">{t("profile.email_readonly")}</label>
              <Input 
                value={currentUser.email} 
                disabled 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("profile.address")}</label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                placeholder={t("profile.address")} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-border/50">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                <Check className="h-4 w-4" /> {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Full Name" value={currentUser.fullName} />
            <Field label="Phone" value={currentUser.phone} />
            <Field label="Email" value={currentUser.email} />
            {currentUser.address && <Field label="Address" value={currentUser.address} />}
            <Field label="Branch" value={branch.name} />
            {currentUser.role === "staff" && currentUser.staffPosition && (
              <Field label="Position" value={currentUser.staffPosition} />
            )}
          </>
        )}
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setPwOpen(true)}>
          Change Password
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-rose-600"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium max-w-[60%] text-right break-words">{value}</span>
    </div>
  );
}
