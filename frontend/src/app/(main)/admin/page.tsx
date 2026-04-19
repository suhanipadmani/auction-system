"use client";

// External
import {
  UsersRound, UserCheck, Gavel,
  BadgeIndianRupee, Tags, ArrowUpRight, IndianRupee
} from "lucide-react";
import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";
import { useAdminStats } from "@/hooks/useAuction";

// UI Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const { data: statsResponse } = useAdminStats();

  const stats = statsResponse?.data || {
    totalAuctions: 0,
    systemRevenue: 0,
    activeUsersCount: 0,
    totalUsersCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <DashboardHeader
        userName="Admin"
        subtitle="Platform Management & System Overview"
        statusLabel="Role"
        statusValue="System Administrator"
      />

      {/* Platform Performance Analytics */}
      <AnalyticsSection title="Platform Analytics" description="System-wide performance and financial overview.">
        <AnalyticsCard
          title="Total Users"
          value={stats.totalUsersCount}
          subtitle="registered on platform"
          icon={<UsersRound className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title="Active Users"
          value={stats.activeUsersCount}
          subtitle="users with active status"
          icon={<UserCheck className="w-5 h-5" />}
          percentage={Math.round((stats.activeUsersCount / (stats.totalUsersCount || 1)) * 100)}
          color="emerald"
        />
        <AnalyticsCard
          title="Total Auctions"
          value={stats.totalAuctions}
          subtitle="all time listings"
          icon={<Gavel className="w-5 h-5" />}
          color="purple"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`₹${stats.systemRevenue.toLocaleString()}`}
          subtitle="gross transaction volume"
          icon={<IndianRupee className="w-5 h-5" />}
          color="emerald"
        />


      </AnalyticsSection>

      {/* Tools & Operations */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            Tools & Operations
          </h2>
          <p className="text-gray-500 text-sm">Manage platform resources and user accounts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
      </section>
    </div>
  );
}
