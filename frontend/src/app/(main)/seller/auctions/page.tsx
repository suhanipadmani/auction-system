"use client";

import { useState } from "react";
import Link from "next/link";

// External
import { Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Types
import { AuctionStatus } from "@/types/auction";

// Hooks
import { useAuctions } from "@/hooks/useAuction";

// Utils
import { cn } from "@/lib/utils";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Button, buttonVariants } from "@/components/ui/Button";

export default function SellerAuctionsPage() {
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<AuctionStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useAuctions({ 
    sellerId: user?._id,
    status: status === "all" ? undefined : status,
    page,
    limit: 12
  });

  const auctions = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalItems = response?.total || 0;

  const TABS = [
    { id: "all", label: "All Listings" },
    { id: "active", label: "Live" },
    { id: "pending", label: "Pending" },
    { id: "past", label: "History" },
  ] as const;

  const handleStatusChange = (newStatus: AuctionStatus | "all") => {
    setStatus(newStatus);
    setPage(1); // Reset to first page on status change
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          title="Auction Management"
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

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleStatusChange(tab.id as any)}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
              status === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-muted-foreground mb-4">
            {status === "all" ? "You haven't created any auctions yet." : `No ${status} auctions found.`}
          </p>
          {status === "all" && (
            <Link
              href="/seller/create"
              className={buttonVariants({ variant: "outline" })}
            >
              Start your first listing
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-10 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} showActions />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-sm text-gray-400">
                    Showing <span className="text-white font-medium">{auctions.length}</span> of <span className="text-white font-medium">{totalItems}</span> auctions
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-white/10 text-gray-300"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-gray-400 px-2 font-medium">
                        Page <span className="text-white font-bold">{page}</span> of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="border-white/10 text-gray-300"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
