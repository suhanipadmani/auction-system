"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
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
  }, [user, router]);

  return null;
}