"use client";

// External
import {
    Wallet, Gavel, Trophy, PlusCircle, ArrowUpRight, Target, History
} from "lucide-react";

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
    const stats = activityResponse?.stats || { activeWinningCount: 0, activeOutbidCount: 0, wonCount: 0 };
    const totalActive = stats.activeWinningCount + stats.activeOutbidCount;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                userName={user?.name}
                subtitle="Your Bidding Dashboard & Portfolio"
                statusValue="Active Bidder"
            />

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardStatCard
                    title="Available Balance"
                    value={formatCurrency(balance)}
                    icon={<Wallet className="w-6 h-6" />}
                    color="emerald"
                    className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5"
                />

                <DashboardStatCard
                    title="Active Bids"
                    value={totalActive.toString()}
                    icon={<Gavel className="w-6 h-6" />}
                    color="indigo"
                />

                <DashboardStatCard
                    title="Auctions Won"
                    value={stats.wonCount.toString()}
                    icon={<Trophy className="w-6 h-6" />}
                    color="amber"
                />
            </div>

            {/* Quick Actions (Bidder Statcards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <QuickActionCard
                    title="Bidding Goals"
                    description="Set budgets and track exposure"
                    icon={<Target className="w-5 h-5 text-indigo-400" />}
                    href="/user/goals"
                    className="border-indigo-500/10 hover:border-indigo-500/30"
                />
                <QuickActionCard
                    title="Explore Auctions"
                    description="View live and upcoming items"
                    icon={<Gavel className="w-5 h-5 text-primary" />}
                    href="/auctions"
                    className="border-primary/10 hover:border-primary/30"
                />
                <QuickActionCard
                    title="My History"
                    description="View won and past auctions"
                    icon={<History className="w-5 h-5 text-amber-400" />}
                    href="/user/auctions"
                    className="border-amber-500/10 hover:border-amber-500/30"
                />
                <QuickActionCard
                    title="Fund Wallet"
                    description="Add balance to place bids"
                    icon={<PlusCircle className="w-5 h-5 text-emerald-400" />}
                    href="/user/wallet"
                    className="border-emerald-500/10 hover:border-emerald-500/30"
                />
            </div>
        </div>
    );
}
