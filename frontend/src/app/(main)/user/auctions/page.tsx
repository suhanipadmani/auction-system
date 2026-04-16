"use client";

import { useState } from "react";
import { useMyBiddingActivity } from "@/hooks/useAuction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Gavel, Trophy, History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IAuctionTabType } from "@/types/auction";


export default function MyBiddingActivityPage() {
    const { data: response, isLoading } = useMyBiddingActivity();
    const [activeTab, setActiveTab] = useState<IAuctionTabType>("active");


    const auctions = response?.data || [];
    
    const filteredAuctions = auctions.filter(auction => {
        if (activeTab === "active") return auction.status === "active";
        if (activeTab === "won") return (auction.status === "sold" || auction.status === "ended") && auction.currentUserStatus === "winning";
        return (auction.status !== "active" && auction.currentUserStatus === "outbid") || (auction.status === "expired");
    });

    const tabs = [
        { id: "active" as IAuctionTabType, label: "Live Bids", icon: <Gavel className="w-4 h-4" /> },
        { id: "won" as IAuctionTabType, label: "Won", icon: <Trophy className="w-4 h-4" /> },
        { id: "past" as IAuctionTabType, label: "History", icon: <History className="w-4 h-4" /> },
    ];


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardHeader
                userName="Bidding"
                subtitle="Track your participation and auction results"
                statusValue="My Activity"
            />

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
            ) : filteredAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                    ))}
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
