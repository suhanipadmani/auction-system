"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { IRoleGateProps } from "@/types/components";

/**
 * RoleGate component ensures that the current authenticated user
 * has the required permissions to access a specific route group.
 */
export function RoleGate({ children, allowedRoles }: IRoleGateProps) {

  const { user, _hasHydrated, isSyncing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {

    if (_hasHydrated && !isSyncing && user && !allowedRoles.includes(user.role)) {
      switch (user.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "seller":
          router.replace("/seller");
          break;
        case "bidder":
        default:
          router.replace("/user");
          break;
      }
    }
  }, [user, _hasHydrated, isSyncing, allowedRoles, router]);

  // Show a loading state while hydration or sync is in progress
  if (!_hasHydrated || isSyncing) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If unauthorized, return null while the router handles redirection
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
