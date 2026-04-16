"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleGate component ensures that the current authenticated user
 * has the required permissions to access a specific route group.
 */
export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only perform check after hydration is complete and we have a user
    if (_hasHydrated && user && !allowedRoles.includes(user.role)) {
      // Protection logic: bounce the user back to their respective landing dashboard
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
  }, [user, _hasHydrated, allowedRoles, router]);

  // Show a loading state while hydration is in progress
  if (!_hasHydrated) {
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
