"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["bidder", "seller"]),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "bidder" }
  });

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Log in to your account and continue bidding"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-3">Login As</label>
          <div className="flex gap-4">
            <label className={`flex-1 cursor-pointer flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              watch("role") === "bidder" || !watch("role") 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}>
              <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity ${watch("role") === "bidder" ? 'opacity-100' : ''}`} />
              <input type="radio" value="bidder" {...register("role")} className="hidden" />
              <span className="font-bold text-lg relative z-10">Bidder</span>
            </label>
            <label className={`flex-1 cursor-pointer flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              watch("role") === "seller" 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity ${watch("role") === "seller" ? 'opacity-100' : ''}`} />
              <input type="radio" value="seller" {...register("role")} className="hidden" />
              <span className="font-bold text-lg relative z-10">Seller</span>
            </label>
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register("password")}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 text-center">
              {(error as any)?.response?.data?.message || "An error occurred during login."}
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-indigo-400 hover:underline font-medium transition-colors">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
