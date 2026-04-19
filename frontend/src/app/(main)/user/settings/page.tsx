"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Mail, Save, Key, ShieldCheck, AlertCircle } from "lucide-react";
import { z } from "zod";

// State
import { useAuthStore } from "@/store/auth.store";

// Components
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// Utils
import { axiosClient } from "@/lib/axios";
import { toast } from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type IProfileForm = z.infer<typeof profileSchema>;
type IPasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<IProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm<IPasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: IProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      const response = await axiosClient.patch("/users/me", data);
      setUser(response.data.data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
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
      toast.success("Password changed successfully");
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader 
        userName="Account Settings" 
        subtitle="Manage your profile information and security preferences"
      />

      <div className="grid grid-cols-1 gap-8">
        {/* General Settings */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              General Information
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Update your basic account details.</p>
          </div>
          
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={<User className="h-5 w-5" />}
                error={profileErrors.name?.message}
                {...registerProfile("name")}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> 
                  Email Address (Read-only)
                </label>
                <div className="h-11 px-4 rounded-xl bg-muted/50 border border-border flex items-center text-muted-foreground text-sm cursor-not-allowed italic">
                  {user?.email}
                </div>
                <p className="text-[10px] text-amber-500/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Email cannot be changed for security purposes.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* Security Settings */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Security & Password
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a strong, unique password.</p>
          </div>
          
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="p-6 space-y-6">
            <div className="max-w-xl space-y-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                icon={<Key className="h-5 w-5" />}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword("currentPassword")}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="New password"
                  icon={<Lock className="h-5 w-5" />}
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword("newPassword")}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm password"
                  icon={<Lock className="h-5 w-5" />}
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword("confirmPassword")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingPassword} variant="secondary" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                Update Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
