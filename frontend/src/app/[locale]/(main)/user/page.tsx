"use client";

// External
import {
    Wallet, Gavel, Trophy, PlusCircle, ArrowUpRight, Target, History, TrendingUp, TrendingDown
} from "lucide-react";
import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useBalance } from "@/hooks/useWallet";
import { useMyBiddingActivity } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { useTranslations } from "next-intl";

export default function UserDashboardPage() {
    const t = useTranslations("common.dashboard.user");
    const user = useAuthStore((state) => state.user);
    const { data: balanceResponse, isLoading: isBalanceLoading } = useBalance();
    const { data: activityResponse, isLoading: isActivityLoading } = useMyBiddingActivity();
    const { formatCurrency } = useCurrency();

    const balance = balanceResponse?.data?.balance || 0;
    const stats = activityResponse?.stats || { 
        activeWinningCount: 0, 
        activeOutbidCount: 0, 
        wonCount: 0,
        lossCount: 0,
        totalSpent: 0
    };
    const totalActive = stats.activeWinningCount + stats.activeOutbidCount;
    const totalCompleted = stats.wonCount + stats.lossCount;
    const winRate = totalCompleted > 0 ? Math.round((stats.wonCount / totalCompleted) * 100) : 0;

    const isLoading = isBalanceLoading || isActivityLoading;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                userName={user?.name}
                subtitle={t("subtitle")}
                statusValue={t("statusValue")}
            />

            {/* Main Stats */}
            {/* Bidder Insights */}
            <AnalyticsSection title={t("insights.title")} description={t("insights.description")}>
                <AnalyticsCard
                    title={t("insights.availableBalance")}
                    value={isBalanceLoading ? "..." : formatCurrency(balance)}
                    subtitle={t("insights.availableBalanceSubtitle")}
                    icon={<Wallet className="w-5 h-5" />}
                    color="emerald"
                />
                <AnalyticsCard
                    title={t("insights.activeBids")}
                    value={isActivityLoading ? "..." : totalActive.toString()}
                    subtitle={t("insights.activeBidsSubtitle")}
                    icon={<Gavel className="w-5 h-5" />}
                    color="indigo"
                />
                <AnalyticsCard
                    title={t("insights.auctionsWon")}
                    value={isActivityLoading ? "..." : stats.wonCount.toString()}
                    subtitle={t("insights.auctionsWonSubtitle")}
                    icon={<Trophy className="w-5 h-5" />}
                    color="amber"
                />
                <AnalyticsCard
                    title={t("insights.totalSpent")}
                    value={isActivityLoading ? "..." : formatCurrency(stats.totalSpent)}
                    subtitle={t("insights.totalSpentSubtitle")}
                    icon={<Wallet className="w-5 h-5" />}
                    color="emerald"
                />
                <AnalyticsCard
                    title={t("insights.winRate")}
                    value={isActivityLoading ? "..." : `${winRate}%`}
                    subtitle={t("insights.winRateSubtitle", { won: stats.wonCount, lost: stats.lossCount })}
                    icon={<TrendingUp className="w-5 h-5" />}
                    percentage={winRate}
                    color="indigo"
                />
                <AnalyticsCard
                    title={t("insights.lossCount")}
                    value={stats.lossCount.toString()}
                    subtitle={t("insights.lossCountSubtitle")}
                    icon={<TrendingDown className="w-5 h-5" />}
                    color="rose"
                />
            </AnalyticsSection>

            {/* Tools & Operations */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        {useTranslations("common.dashboard")("toolsAndOperations")}
                    </h2>
                    <p className="text-gray-500 text-sm">{t("tools.description")}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <QuickActionCard
                        title={t("tools.goalsTitle")}
                        description={t("tools.goalsDesc")}
                        icon={<Target className="w-5 h-5 text-indigo-400 group-hover:text-indigo-400" />}
                        href="/user/goals"
                        color="indigo"
                    />
                    <QuickActionCard
                        title={t("tools.marketplaceTitle")}
                        description={t("tools.marketplaceDesc")}
                        icon={<Gavel className="w-5 h-5 text-primary group-hover:text-primary" />}
                        href="/auctions"
                        color="purple"
                    />
                    <QuickActionCard
                        title={t("tools.historyTitle")}
                        description={t("tools.historyDesc")}
                        icon={<History className="w-5 h-5 text-amber-400 group-hover:text-amber-400" />}
                        href="/user/auctions"
                        color="amber"
                    />
                    <QuickActionCard
                        title={t("tools.fundWalletTitle")}
                        description={t("tools.fundWalletDesc")}
                        icon={<PlusCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-400" />}
                        href="/user/wallet"
                        color="emerald"
                    />
                </div>
            </section>
        </div>
    );
}
