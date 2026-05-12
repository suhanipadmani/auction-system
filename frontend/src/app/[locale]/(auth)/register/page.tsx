"use client";

import Link from "next/link";

// External
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
// Types
import { IRegisterForm } from "@/types/forms";
import { USER_ROLES } from "@/enums/user.enum";
// Validation
import { registerSchema } from "@/validations/auth.validation"
// Hooks
import { useRegister } from "@/hooks/useAuth";
// UI Components
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";


export default function RegisterPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { mutate: registerUser, isPending, error } = useRegister();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: USER_ROLES.BIDDER }
  });

  const onSubmit = (data: IRegisterForm) => {
    registerUser(data);
  };

  return (
    <AuthLayout 
      title={t("registerTitle")} 
      subtitle={t("registerSubtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={t("fullName")}
          type="text"
          placeholder="John Doe"
          icon={<User className="h-5 w-5" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-3">{t("accountType")}</label>
          <div className="flex gap-4">
            <label className={`flex-1 cursor-pointer flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              watch("role") === USER_ROLES.BIDDER || !watch("role") 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}>
              <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity ${watch("role") === USER_ROLES.BIDDER ? 'opacity-100' : ''}`} />
              <input type="radio" value={USER_ROLES.BIDDER} {...register("role")} className="hidden" />
              <span className="font-bold text-lg relative z-10">{t("bidder")}</span>
            </label>
            <label className={`flex-1 cursor-pointer flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              watch("role") === USER_ROLES.SELLER 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}>
              <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity ${watch("role") === USER_ROLES.SELLER ? 'opacity-100' : ''}`} />
              <input type="radio" value={USER_ROLES.SELLER} {...register("role")} className="hidden" />
              <span className="font-bold text-lg relative z-10">{t("seller")}</span>
            </label>
          </div>
        </div>

        <Input
          label={t("email")}
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={t("password")}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 hover:text-white transition-colors outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 text-center">
              {(error as any)?.response?.data?.message || t("registerError")}
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full mt-2">
          {t("createAccountBtn")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")} {" "}
        <Link href="/login" className="text-indigo-400 hover:underline font-medium transition-colors">
          {t("signInInstead")}
        </Link>
      </p>
    </AuthLayout>
  );
}
