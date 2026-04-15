"use client";

// External
import {
  UsersRound, UserCheck, Gavel,
  BadgeIndianRupee, Tags, ArrowUpRight
} from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useUsers } from "@/hooks/useUsers";

// UI Components
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const { data: usersResponse } = useUsers();

  const users = usersResponse?.data || [];
  const activeUsersCount = users.filter((u: any) => u.status === "active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <DashboardHeader
        userName="Admin"
        subtitle="Platform Management & System Overview"
        statusLabel="Role"
        statusValue="System Administrator"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardStatCard
          title="Total Users"
          value={users.length}
          icon={<UsersRound className="w-6 h-6" />}
          color="indigo"
        />
        <DashboardStatCard
          title="Active Users"
          value={activeUsersCount}
          icon={<UserCheck className="w-6 h-6" />}
          color="emerald"
        />
        <DashboardStatCard
          title="Total Auctions"
          value="0"
          icon={<Gavel className="w-6 h-6" />}
          color="purple"
        />
        <DashboardStatCard
          title="System Revenue"
          value="₹0"
          icon={<BadgeIndianRupee className="w-6 h-6" />}
          color="amber"
          className="lg:col-span-1"
        />
        <DashboardStatCard
          title="Bids Today"
          value="0"
          icon={<Tags className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Admin Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Wallet Control"
          description="Process deposits and manual balance adjustments"
          icon={<ArrowUpRight className="w-6 h-6" />}
          href="/admin/wallet"
          color="indigo"
        />
        <QuickActionCard
          title="Auction Management"
          description="Review and approve pending auction listings"
          icon={<Gavel className="w-8 h-8" />}
          href="/admin/auctions"
          color="purple"
        />
      </div>
    </div>
  );
}
