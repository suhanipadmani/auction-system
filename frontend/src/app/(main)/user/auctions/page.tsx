"use client";

import { useState } from "react";

// External
import { Loader2, Search, SlidersHorizontal } from "lucide-react";

// Types
import { AuctionStatus } from "@/types/auction";

// Hooks
import { useAuctions } from "@/hooks/useAuction";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function BidderAuctionsPage() {
  const [status, setStatus] = useState<AuctionStatus | undefined>("active");
  const { data: response, isLoading } = useAuctions({ status });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          userName="Live Marketplace"
          subtitle="Explore active auctions and place your bids."
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items, categories, or sellers..." 
            className="pl-10 bg-white/5 border-white/10 w-full"
          />
        </div>
        <div className="flex gap-2">
            <Button 
                variant={status === "active" ? "default" : "outline"}
                onClick={() => setStatus("active")}
                className={status === "active" ? "bg-emerald-600 hover:bg-emerald-700" : "border-white/10"}
            >
                Live Now
            </Button>
            <Button 
                variant={status === "approved" ? "default" : "outline"}
                onClick={() => setStatus("approved")}
                className={status === "approved" ? "bg-indigo-600 hover:bg-indigo-700" : "border-white/10"}
            >
                Upcoming
            </Button>
            <Button variant="outline" className="border-white/10">
                <SlidersHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : response?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-muted-foreground">No auctions found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {response?.data.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
