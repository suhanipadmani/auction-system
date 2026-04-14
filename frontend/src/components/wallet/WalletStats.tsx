"use client";

import { History, Search, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { usePendingDeposits } from "@/hooks/useWallet";
import { useUsers } from "@/hooks/useUsers";

export function WalletStats() {
  const { data: pendingData, isLoading: isPendingLoading } = usePendingDeposits("pending");
  const { data: usersData, isLoading: isUsersLoading } = useUsers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Pending Requests"
        value={isPendingLoading ? "..." : pendingData?.data?.length || 0}
        icon={<History className="h-6 w-6 text-amber-400" />}
        iconContainerClass="bg-amber-400/10 border border-amber-400/20"
      />
      <StatCard
        title="Total Users"
        value={isUsersLoading ? "..." : usersData?.data?.length || 0}
        icon={<Search className="h-6 w-6 text-indigo-400" />}
        iconContainerClass="bg-indigo-400/10 border border-indigo-400/20"
      />
      <StatCard
        title="System Health"
        value="Healthy"
        icon={<ShieldAlert className="h-6 w-6 text-emerald-400" />}
        iconContainerClass="bg-emerald-400/10 border border-emerald-400/20"
      />
    </div>
  );
}
