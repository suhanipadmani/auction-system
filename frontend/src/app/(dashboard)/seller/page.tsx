"use client";

import { useAuthStore } from "@/store/auth.store";
import { Tags, Gavel, PlusCircle, LayoutDashboard, BadgeIndianRupee, ArrowUpRight } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

export default function SellerDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <DashboardHeader
        userName="Seller Studio"
        subtitle="Manage your listings and track your sales performance."
        statusValue="Verified Seller"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardStatCard
          title="Total Earnings"
          value="₹0"
          icon={<BadgeIndianRupee className="w-6 h-6" />}
          color="emerald"
        />
        <DashboardStatCard
          title="Active Listings"
          value="0"
          icon={<Tags className="w-6 h-6" />}
          color="indigo"
        />
        <DashboardStatCard
          title="Completed Sales"
          value="0"
          icon={<Gavel className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Seller Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <QuickActionCard
          title="Explore Auctions"
          description="Browse live and upcoming auctions"
          icon={<ArrowUpRight className="w-8 h-8" />}
          href="/user/auctions"
          color="emerald"
        />

        <QuickActionCard
          title="Payout Account"
          description="Manage where your earnings are deposited"
          icon={<LayoutDashboard className="w-6 h-6" />}
          href="/user/wallet"
          color="blue"
        />
      </div>
    </div>
  );
}
