"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/useAuth";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["bidder", "seller"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { mutate: registerUser, isPending, error } = useRegister();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "bidder" }
  });

  const onSubmit = (data: RegisterForm) => {
    registerUser(data);
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start bidding on exclusive items today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User className="h-5 w-5" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-3">Account Type</label>
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
              <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity ${watch("role") === "seller" ? 'opacity-100' : ''}`} />
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
              {(error as any)?.response?.data?.message || "An error occurred during registration."}
            </p>
          </div>
        )}

        <Button type="submit" isLoading={isPending} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline font-medium transition-colors">
          Sign in instead
        </Link>
      </p>
    </AuthLayout>
  );
}
