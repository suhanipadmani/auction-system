"use client";

import Link from "next/link";

// External
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// Types
import { ILoginForm } from "@/types/forms";
import { USER_ROLES } from "@/enums/user.enum";
// Validation
import { loginSchema } from "@/validations/auth.validation";
// Hooks
import { useLogin } from "@/hooks/useAuth";

// UI Components
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";


export default function LoginPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, setError, formState: { errors, isValid } } = useForm<ILoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { role: USER_ROLES.BIDDER }
  });

  const onSubmit = (data: ILoginForm) => {
    login(data, {
      onError: (err: any) => {
        const details = err?.response?.data?.details;
        if (details && typeof details === 'object') {
          Object.keys(details).forEach((key) => {
            setError(key as any, {
              type: 'manual',
              message: details[key]
            });
          });
        }
      }
    });
  };

  return (
    <AuthLayout 
      title={t("loginTitle")} 
      subtitle={t("loginSubtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <Input
          label={t("email")}
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register("email")}
          required = {true}
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
          required = {true}
        />

        <div className="flex justify-end">
          <Link 
            href="/forgot-password" 
            className="text-xs text-indigo-400 hover:underline font-medium transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {!!error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 text-center">
              {(error as any)?.response?.data?.message || t("loginError")}
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} disabled={!isValid} className="w-full">
          {t("signIn")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("dontHaveAccount")} {" "}
        <Link href="/register" className="text-indigo-400 hover:underline font-medium transition-colors">
          {t("createAccount")}
        </Link>
      </p>
    </AuthLayout>
  );
}
