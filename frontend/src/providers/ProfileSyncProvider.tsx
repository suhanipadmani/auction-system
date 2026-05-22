"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { userApi } from "@/api/user.api";
import { useSocket } from "./SocketProvider";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { USER_STATUSES } from "@/enums/user.enum";

export function ProfileSyncProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setSyncing = useAuthStore((state) => state.setSyncing);

  const { socket } = useSocket();
  const [isSynced, setIsSynced] = useState(false);

  // Reset sync status when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsSynced(false);
    }
  }, [isAuthenticated]);

  // 1. Initial Sync on mount/refresh
  useEffect(() => {
    const syncProfile = async () => {
      if (_hasHydrated && isAuthenticated && !isSynced) {
        // Immediately set synced to true to prevent looping requests
        setIsSynced(true);
        try {
          setSyncing(true);
          const userData = await userApi.getMe();
          setUser(userData);
        } catch (error: any) {
          console.error("Failed to sync profile:", error);
          // If it was an auth error, log out
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          } else {
            // If it was another error (like 429), we've already set isSynced=true
            // so it won't retry immediately in a loop.
          }
        } finally {
          setSyncing(false);
        }
      }
    };

    syncProfile();
  }, [_hasHydrated, isAuthenticated, isSynced, setUser, logout, setSyncing]);

  // 2. Real-time updates via Sockets
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleStatusChange = (data: { status: string }) => {
      if (data.status === USER_STATUSES.INACTIVE || data.status === USER_STATUSES.DELETED) {
        toast.error(t("accountDeactivated"), { duration: 5000 });
        logout();
      } else {
        userApi.getMe().then(setUser).catch(console.error);
      }
    };

    const handleAccountUpdate = () => {
      toast.success(t("accountUpdated"));
      userApi.getMe().then(setUser).catch(console.error);
    };

    socket.on("account_status_changed", handleStatusChange);
    socket.on("account_updated", handleAccountUpdate);

    return () => {
      socket.off("account_status_changed", handleStatusChange);
      socket.off("account_updated", handleAccountUpdate);
    };
  }, [socket, isAuthenticated, logout, setUser, t]);
  
  return <>{children}</>;
}
