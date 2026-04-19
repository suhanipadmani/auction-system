"use client";

import { useState } from "react";
import { useMyBiddingActivity } from "@/hooks/useAuction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Gavel, Trophy, History, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IAuctionTabType } from "@/types/auction";
import { Button } from "@/components/ui/Button";


export default function MyBiddingActivityPage() {
    const [activeTab, setActiveTab] = useState<IAuctionTabType>("active");
    const [page, setPage] = useState(1);

    const { data: response, isLoading } = useMyBiddingActivity({
        tab: activeTab,
        page,
        limit: 20
    });

    const auctions = response?.data || [];
    const totalPages = response?.totalPages || 1;
    const totalItems = response?.total || 0;

    const tabs = [
        { id: "active" as IAuctionTabType, label: "Live Bids", icon: <Gavel className="w-4 h-4" /> },
        { id: "won" as IAuctionTabType, label: "Won", icon: <Trophy className="w-4 h-4" /> },
        { id: "past" as IAuctionTabType, label: "History", icon: <History className="w-4 h-4" /> },
    ];


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                title="Bidding Activity"
                subtitle="Track your participation and auction results"
                statusValue="My Activity"
            />

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setPage(1);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
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

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading your activity...</p>
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
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl gap-4">
                    <div className="p-4 rounded-full bg-white/5">
                        {activeTab === "active" ? <Gavel className="w-8 h-8 text-muted-foreground" /> : 
                         activeTab === "won" ? <Trophy className="w-8 h-8 text-muted-foreground" /> : 
                         <History className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">No auctions found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {activeTab === "active" ? "You haven't placed any bids on live auctions yet." : 
                             activeTab === "won" ? "You haven't won any auctions yet. Keep bidding!" : 
                             "No past auction activity found."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
