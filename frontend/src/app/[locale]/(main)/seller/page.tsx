"use client";

// External
import { Tags, Gavel, PlusCircle, LayoutDashboard, ArrowUpRight, Target, TrendingUp, Award, Wallet } from "lucide-react";
import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

// Hooks
import { useSellerStats } from "@/hooks/useAuction";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";

export default function SellerDashboardPage() {
  const t = useTranslations("common.dashboard.seller");
  const { formatCurrency } = useCurrency();
  const user = useAuthStore((state) => state.user);
  const { data: statsResponse, isLoading } = useSellerStats();

  const stats = statsResponse?.data || {
    totalEarnings: 0,
    activeListings: 0,
    completedSales: 0,
    successRate: 0,
    avgHighestBid: 0,
    maxBidReceived: 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <DashboardHeader
        userName={user?.name || t("studio")}
        subtitle={t("subtitle")}
        statusValue={t("statusValue")}
      />

      {/* Seller Performance Analytics */}
      <AnalyticsSection title={t("performance.title")} description={t("performance.description")}>
        <AnalyticsCard
          title={t("performance.activeListings")}
          value={isLoading ? "..." : stats.activeListings.toString()}
          subtitle={t("performance.activeListingsSubtitle")}
          icon={<Tags className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title={t("performance.completedSales")}
          value={isLoading ? "..." : stats.completedSales.toString()}
          subtitle={t("performance.completedSalesSubtitle")}
          icon={<Gavel className="w-5 h-5" />}
          color="purple"
        />
        <AnalyticsCard
          title={t("performance.successRate")}
          value={`${stats.successRate}%`}
          subtitle={t("performance.successRateSubtitle")}
          icon={<Target className="w-5 h-5" />}
          percentage={stats.successRate}
          color="emerald"
        />
        <AnalyticsCard
          title={t("performance.avgHighBid")}
          value={formatCurrency(stats.avgHighestBid)}
          subtitle={t("performance.avgHighBidSubtitle")}
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title={t("performance.highestBidEver")}
          value={formatCurrency(stats.maxBidReceived)}
          subtitle={t("performance.highestBidEverSubtitle")}
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <AnalyticsCard
          title={t("performance.totalProceeds")}
          value={formatCurrency(stats.totalEarnings)}
          subtitle={t("performance.totalProceedsSubtitle")}
          icon={<Wallet className="w-5 h-5" />}
          color="teal"
        />
      </AnalyticsSection>


      {/* Tools & Operations */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            {useTranslations("common.dashboard")("toolsAndOperations")}
          </h2>
          <p className="text-gray-500 text-sm">{t("tools.description")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <QuickActionCard
            title={t("tools.listNewItemTitle")}
            description={t("tools.listNewItemDesc")}
            icon={<PlusCircle className="w-10 h-10" />}
            href="/seller/create"
            color="indigo"
          />

          <QuickActionCard
            title={t("tools.myAuctionsTitle")}
            description={t("tools.myAuctionsDesc")}
            icon={<Gavel className="w-8 h-8" />}
            href="/seller/auctions"
            color="purple"
          />
          
        </div>
      </section>
    </div>
  );
}
