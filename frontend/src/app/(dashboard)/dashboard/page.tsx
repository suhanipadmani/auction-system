"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Role-based routing logic
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