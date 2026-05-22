"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Mail, Save, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { profileSchema, passwordSchema } from "@/validations/user.validation";

// State
import { useAuthStore } from "@/store/auth.store";

// Components
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// Utils
import { axiosClient } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

type IProfileForm = z.infer<typeof profileSchema>;
type IPasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const t = useTranslations("settings");
  const te = useTranslations("common.errors");
  const { user, setUser } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors, isValid: isProfileValid } } = useForm<IProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { name: user?.name || "" }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors, isValid: isPasswordValid } } = useForm<IPasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const onUpdateProfile = async (data: IProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      const response = await axiosClient.patch("/users/me", data);
      setUser(response.data.data);
      toast.success(t("general.success"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || te("unknown"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: IPasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      await axiosClient.patch("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success(t("security.success"));
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || te("unknown"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="grid grid-cols-1 gap-8">
        {/* General Settings */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              {t("general.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t("general.description")}</p>
          </div>

          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("general.fullName")}
                icon={<User className="h-5 w-5" />}
                error={profileErrors.name?.message}
                {...registerProfile("name")}
                required
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("general.email")}
                </label>
                <div className="h-11 px-4 rounded-xl bg-muted/50 border border-border flex items-center text-muted-foreground text-sm cursor-not-allowed italic">
                  {user?.email}
                </div>
                <p className="text-[10px] text-amber-500/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {t("general.emailWarning")}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingProfile} disabled={!isProfileValid} className="gap-2">
                <Save className="w-4 h-4" />
                {t("general.save")}
              </Button>
            </div>
          </form>
        </section>

        {/* Security Settings */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {t("security.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t("security.description")}</p>
          </div>

          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="p-6 space-y-6">
            <div className="max-w-xl space-y-6">
              <Input
                label={t("security.currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                placeholder={t("security.currentPasswordPlaceholder")}
                icon={<Key className="h-5 w-5" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                }
                error={passwordErrors.currentPassword?.message}
                {...registerPassword("currentPassword")}
                required={true}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t("security.newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("security.newPasswordPlaceholder")}
                  icon={<Lock className="h-5 w-5" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  }
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword("newPassword")}
                  required={true}
                />
                <Input
                  label={t("security.confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("security.confirmPasswordPlaceholder")}
                  icon={<Lock className="h-5 w-5" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  }
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword("confirmPassword")}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingPassword} disabled={!isPasswordValid} variant="secondary" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t("security.update")}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
