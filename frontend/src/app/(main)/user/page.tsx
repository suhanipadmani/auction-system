"use client";

// External
import {
    Wallet, Gavel, Trophy, PlusCircle, ArrowUpRight
} from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useBalance } from "@/hooks/useWallet";

// Utils 
import { formatCurrency } from "@/lib/utils";

// Components
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

export default function UserDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const { data: balanceResponse } = useBalance();

    const balance = balanceResponse?.data?.balance || 0;

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
                    value="0"
                    icon={<Gavel className="w-6 h-6" />}
                    color="indigo"
                />

                <DashboardStatCard
                    title="Auctions Won"
                    value="0"
                    icon={<Trophy className="w-6 h-6" />}
                    color="amber"
                />
            </div>

            {/* Bidder Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActionCard
                    title="Add Funds"
                    description="Request a deposit to start participating in auctions"
                    icon={<PlusCircle className="w-8 h-8" />}
                    href="/user/wallet"
                    color="indigo"
                />
                <QuickActionCard
                    title="Explore Auctions"
                    description="Browse live and upcoming auctions"
                    icon={<ArrowUpRight className="w-8 h-8" />}
                    href="/user/auctions"
                    color="emerald"
                />
            </div>
        </div>
    );
}
