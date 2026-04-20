"use client";

// External
import { Tags, Gavel, PlusCircle, LayoutDashboard, BadgeIndianRupee, ArrowUpRight, Target, TrendingUp, Award, IndianRupee } from "lucide-react";
import { AnalyticsSection, AnalyticsCard } from "@/components/dashboard/AnalyticsSection";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

// Hooks
import { useSellerStats } from "@/hooks/useAuction";

// Utils
import { formatCurrency } from "@/lib/utils";

export default function SellerDashboardPage() {
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
        userName={user?.name || "Seller Studio"}
        subtitle="Manage your listings and track your sales performance."
        statusValue="Verified Seller"
      />

      {/* Seller Performance Analytics */}
      <AnalyticsSection title="Seller Performance" description="Insights into your auction success and market value.">
        <AnalyticsCard
          title="Active Listings"
          value={isLoading ? "..." : stats.activeListings.toString()}
          subtitle="currently live for bidding"
          icon={<Tags className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title="Completed Sales"
          value={isLoading ? "..." : stats.completedSales.toString()}
          subtitle="successfully ended auctions"
          icon={<Gavel className="w-5 h-5" />}
          color="purple"
        />
        <AnalyticsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle="Auctions sold vs listed"
          icon={<Target className="w-5 h-5" />}
          percentage={stats.successRate}
          color="emerald"
        />
        <AnalyticsCard
          title="Average High Bid"
          value={formatCurrency(stats.avgHighestBid)}
          subtitle="per auction with bids"
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
        <AnalyticsCard
          title="Highest Bid Ever"
          value={formatCurrency(stats.maxBidReceived)}
          subtitle="your personal record"
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <AnalyticsCard
          title="Total Proceeds"
          value={formatCurrency(stats.totalEarnings)}
          subtitle="lifetime earnings"
          icon={<IndianRupee className="w-5 h-5" />}
          color="teal"
        />
      </AnalyticsSection>


      {/* Tools & Operations */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            Tools & Operations
          </h2>
          <p className="text-gray-500 text-sm">Create auctions, manage listings, and view your records.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <QuickActionCard
            title="List New Item"
            description="Create a new auction listing for bidders"
            icon={<PlusCircle className="w-10 h-10" />}
            href="/seller/create"
            color="indigo"
          />

          <QuickActionCard
            title="My Auctions"
            description="Manage your active and pending listings"
            icon={<Gavel className="w-8 h-8" />}
            href="/seller/auctions"
            color="purple"
          />
          
        </div>
      </section>
    </div>
  );
}
