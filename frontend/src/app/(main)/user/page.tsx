"use client";

// External
import {
    Wallet, Gavel, Trophy, PlusCircle, ArrowUpRight, Target, History, TrendingUp, TrendingDown, IndianRupee
} from "lucide-react";
import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useBalance } from "@/hooks/useWallet";
import { useMyBiddingActivity } from "@/hooks/useAuction";

// Utils 
import { formatCurrency } from "@/lib/utils";

// Components
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

export default function UserDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const { data: balanceResponse } = useBalance();
    const { data: activityResponse } = useMyBiddingActivity();

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

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                userName={user?.name}
                subtitle="Your Bidding Dashboard & Portfolio"
                statusValue="Active Bidder"
            />

            {/* Main Stats */}
            {/* Bidder Insights */}
            <AnalyticsSection title="Bidding Insights" description="Detailed performance metrics for your bidding activity.">
                <AnalyticsCard
                    title="Available Balance"
                    value={formatCurrency(balance)}
                    subtitle="ready for new bids"
                    icon={<Wallet className="w-5 h-5" />}
                    color="emerald"
                />
                <AnalyticsCard
                    title="Active Bids"
                    value={totalActive.toString()}
                    subtitle="current ongoing bids"
                    icon={<Gavel className="w-5 h-5" />}
                    color="indigo"
                />
                <AnalyticsCard
                    title="Auctions Won"
                    value={stats.wonCount.toString()}
                    subtitle="successfully acquired items"
                    icon={<Trophy className="w-5 h-5" />}
                    color="amber"
                />
                <AnalyticsCard
                    title="Total Spent"
                    value={formatCurrency(stats.totalSpent)}
                    subtitle="across all won auctions"
                    icon={<IndianRupee className="w-5 h-5" />}
                    color="emerald"
                />
                <AnalyticsCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    subtitle={`${stats.wonCount} won vs ${stats.lossCount} lost`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    percentage={winRate}
                    color="indigo"
                />
                <AnalyticsCard
                    title="Loss Count"
                    value={stats.lossCount.toString()}
                    subtitle="auctions ended without winning"
                    icon={<TrendingDown className="w-5 h-5" />}
                    color="rose"
                />
            </AnalyticsSection>

            {/* Tools & Operations */}
            <section className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        Tools & Operations
                    </h2>
                    <p className="text-gray-500 text-sm">Manage your bidding goals, fund your wallet, and explore auctions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <QuickActionCard
                        title="Bidding Goals"
                        description="Set budgets and track exposure"
                        icon={<Target className="w-5 h-5 text-indigo-400 group-hover:text-indigo-400" />}
                        href="/user/goals"
                        color="indigo"
                    />
                    <QuickActionCard
                        title="Explore Auctions"
                        description="View live and upcoming items"
                        icon={<Gavel className="w-5 h-5 text-primary group-hover:text-primary" />}
                        href="/auctions"
                        color="purple"
                    />
                    <QuickActionCard
                        title="My History"
                        description="View won and past auctions"
                        icon={<History className="w-5 h-5 text-amber-400 group-hover:text-amber-400" />}
                        href="/user/auctions"
                        color="amber"
                    />
                    <QuickActionCard
                        title="Fund Wallet"
                        description="Add balance to place bids"
                        icon={<PlusCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-400" />}
                        href="/user/wallet"
                        color="emerald"
                    />
                </div>
            </section>
        </div>
    );
}
