"use client";

import { useAuctions } from "@/hooks/useAuction";
import { useAuthStore } from "@/store/auth.store";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SellerAuctionsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: response, isLoading } = useAuctions({ sellerId: user?._id });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          userName="My Auctions"
          subtitle="Manage your listed items and track their status."
        />
        <Link
          href="/seller/create"
          className={cn(buttonVariants({ variant: "default" }), "bg-indigo-600 hover:bg-indigo-700")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : response?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-muted-foreground mb-4">You haven't created any auctions yet.</p>
          <Link
            href="/seller/create"
            className={buttonVariants({ variant: "outline" })}
          >
            Start your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {response?.data.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} showActions />
          ))}
        </div>
      )}
    </div>
  );
}
