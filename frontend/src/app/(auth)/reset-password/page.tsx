"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { z } from "zod";

// UI Components
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Utils
import { axiosClient } from "@/lib/axios";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type IResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<IResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const onSubmit = async (data: IResetPasswordForm) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await axiosClient.post("/auth/reset-password", {
        token,
        password: data.password
      });
      setIsSubmitted(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. The link may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout 
        title="Password Reset Successful" 
        subtitle="Your password has been changed. Redirecting to login..."
      >
        <div className="flex flex-col items-center justify-center space-y-6 pt-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Sign In Now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Set New Password" 
      subtitle="Enter your new password below to secure your account."
    >
      {!token ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/forgot-password">
            <Button variant="secondary" className="w-full">Request New Link</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 transition-colors outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Reset Password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
