"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardRedirect() {
  const { user, isSyncing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isSyncing) return;
    
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Role-based routing 
    switch (user.role) {
      case "admin":
        router.replace("/admin");
        break;
      case "bidder":
        router.replace("/user");
        break;
      case "seller":
        router.replace("/seller");
        break;
      default:
        router.replace("/user");
    }
  }, [user, router, isSyncing]);

  return <DashboardSkeleton />;
}