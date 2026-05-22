"use client";

// External
import { UsersRound, UserCheck, Gavel, ArrowUpRight, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAdminStats } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";

import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("common.dashboard.admin");
  const commonT = useTranslations("common.dashboard");
  const user = useAuthStore((state) => state.user);
  const { data: statsResponse, isLoading } = useAdminStats();
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = statsResponse?.data || {
    totalAuctions: 0,
    systemRevenue: 0,
    activeUsersCount: 0,
    totalUsersCount: 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <DashboardHeader
        userName={user?.name || "Admin"}
        subtitle={t("subtitle")}
        statusLabel={t("role")}
        statusValue={t("statusValue")}
      />

      {/* Platform Performance Analytics */}
      <AnalyticsSection title={t("analytics.title")} description={t("analytics.description")}>
        <AnalyticsCard
          title={t("analytics.totalUsers")}
          value={stats.totalUsersCount}
          subtitle={t("analytics.totalUsersSubtitle")}
          icon={<UsersRound className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title={t("analytics.activeUsers")}
          value={stats.activeUsersCount}
          subtitle={t("analytics.activeUsersSubtitle")}
          icon={<UserCheck className="w-5 h-5" />}
          percentage={Math.round((stats.activeUsersCount / (stats.totalUsersCount || 1)) * 100)}
          color="emerald"
        />
        <AnalyticsCard
          title={t("analytics.totalAuctions")}
          value={stats.totalAuctions}
          subtitle={t("analytics.totalAuctionsSubtitle")}
          icon={<Gavel className="w-5 h-5" />}
          color="purple"
        />
        <AnalyticsCard
          title={t("analytics.totalRevenue")}
          value={formatCurrency(stats.systemRevenue)}
          subtitle={t("analytics.totalRevenueSubtitle")}
          icon={<Wallet className="w-5 h-5" />}
          color="emerald"
        />
      </AnalyticsSection>

      {/* Tools & Operations */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            {commonT("toolsAndOperations")}
          </h2>
          <p className="text-gray-500 text-sm">{t("tools.description")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <QuickActionCard
            title={t("tools.walletControlTitle")}
            description={t("tools.walletControlDesc")}
            icon={<ArrowUpRight className="w-6 h-6" />}
            href="/admin/wallet"
            color="indigo"
          />
          <QuickActionCard
            title={t("tools.auctionManagementTitle")}
            description={t("tools.auctionManagementDesc")}
            icon={<Gavel className="w-8 h-8" />}
            href="/admin/auctions"
            color="purple"
          />
        </div>
      </section>
    </div>
  );
}
