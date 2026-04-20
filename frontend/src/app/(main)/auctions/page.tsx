"use client";

import { useState, useEffect } from "react";
import { useAuctions } from "@/hooks/useAuction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Gavel, Calendar, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IDiscoveryTabType } from "@/types/auction";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BiddingGoalsOverview } from "@/components/auctions/BiddingGoalsOverview";
import { useAuthStore } from "@/store/auth.store";

export default function AuctionDiscoveryPage() {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState<IDiscoveryTabType>("live");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // Debounce search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: response, isLoading } = useAuctions({
        status: activeTab === "live" ? "active" : "approved",
        search: debouncedSearch || undefined,
        page,
        limit: 20
    });

    const auctions = response?.data || [];
    const totalPages = response?.totalPages || 1;
    const totalAuctions = response?.total || 0;

    const tabs = [
        { id: "live" as IDiscoveryTabType, label: "Live Now", icon: <Gavel className="w-4 h-4" /> },
        { id: "upcoming" as IDiscoveryTabType, label: "Upcoming", icon: <Calendar className="w-4 h-4" /> },
    ];

    const isBidder = user?.role === "bidder";

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                title="Explore Marketplace"
                subtitle="Discover live bidding wars and bookmark upcoming gems"
                statusValue="Marketplace"
            />

            {isBidder && <BiddingGoalsOverview />}

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full md:w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="w-full md:w-80">
                    <Input
                        placeholder="Search auctions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                        className="bg-white/5 border-white/10"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                    </div>
                    <p className="text-muted-foreground font-medium">Scanning the marketplace...</p>
                </div>
            ) : auctions.length > 0 ? (
                <div className="space-y-10 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                            <p className="text-sm text-gray-400">
                                Showing <span className="text-white font-medium">{auctions.length}</span> of <span className="text-white font-medium">{totalAuctions}</span> auctions
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
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl gap-6 animate-in zoom-in-95 duration-500">
                    <div className="p-5 rounded-3xl bg-white/5 relative group">
                        <div className="absolute inset-0 blur-2xl bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all" />
                        {activeTab === "live" ? (
                            <Gavel className="w-10 h-10 text-muted-foreground relative" />
                        ) : (
                            <Calendar className="w-10 h-10 text-muted-foreground relative" />
                        )}
                    </div>
                    <div className="text-center max-w-sm px-6">
                        <h3 className="text-xl font-bold text-white">No auctions found</h3>
                        <p className="text-muted-foreground mt-2">
                            {searchQuery 
                                ? `We couldn't find any ${activeTab} auctions matching "${searchQuery}".`
                                : activeTab === "live" 
                                    ? "There are currently no live auctions. Check back soon for new opportunities!"
                                    : "No upcoming auctions scheduled at the moment. Sellers are preparing new listings."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
