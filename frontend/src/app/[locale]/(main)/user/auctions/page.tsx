"use client";

import { useState, useEffect } from "react";
import { useMyBiddingActivity } from "@/hooks/useAuction";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Gavel, Trophy, History, Loader2, Search, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { IAuctionTabType } from "@/types/auction";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";


import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "next-intl";


export default function MyBiddingActivityPage() {
    const t = useTranslations("auction.activity");
    const tm = useTranslations("auction.management");
    const commonT = useTranslations("common");

    const [activeTab, setActiveTab] = useState<IAuctionTabType>("active");
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [sortConfig, setSortConfig] = useState<string>("endTime-desc");

    const [sortBy, sortOrder] = sortConfig.split("-");
    const { data: response, isLoading } = useMyBiddingActivity({
        tab: activeTab,
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder: sortOrder as any
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const auctions = response?.data || [];
    const totalPages = response?.totalPages || 1;
    const totalItems = response?.total || 0;

    const tabs = [
        { id: "active" as IAuctionTabType, label: t("tabs.active"), icon: <Gavel className="w-4 h-4" /> },
        { id: "won" as IAuctionTabType, label: t("tabs.won"), icon: <Trophy className="w-4 h-4" /> },
        { id: "past" as IAuctionTabType, label: t("tabs.past"), icon: <History className="w-4 h-4" /> },
    ];

    const sortOptions = [
        { value: "endTime-desc", label: tm("sort.newest") },
        { value: "endTime-asc", label: tm("sort.oldest") },
        { value: "highestBid-desc", label: tm("sort.priceHigh") },
        { value: "highestBid-asc", label: tm("sort.priceLow") },
        { value: "createdAt-desc", label: tm("sort.newest") },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DashboardHeader
            title={t("title")}
            subtitle={t("subtitle")}
            statusValue={t("status")}
          />

          {/* Tabs and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 bg-white/5 border-white/10 pl-10"
                  icon={<Search className="w-4 h-4 text-gray-500" />}
                />
              </div>

              <Dropdown
                value={sortConfig}
                onChange={(val) => {
                  if (val) setSortConfig(val);
                  setPage(1);
                }}
                triggerIcon={<ListFilter className="w-4 h-4 text-gray-500" />}
                options={sortOptions}
                placeholder={tm("sortBy")}
                triggerClassName="h-10 w-full sm:w-44 bg-white/5 border-white/10 text-gray-300"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">{t("loading")}</p>
            </div>
          ) : auctions.length > 0 ? (
            <div className="space-y-10 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                showingCount={auctions.length}
                onPageChange={setPage}
                typeLabel={t('status')}
              />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl gap-4">
                  <div className="p-4 rounded-full bg-white/5">
                    {activeTab === "active" ? <Gavel className="w-8 h-8 text-muted-foreground" /> : 
                    activeTab === "won" ? <Trophy className="w-8 h-8 text-muted-foreground" /> : 
                    <History className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold">{t("empty.title")}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === "active" ? t("empty.active") : 
                      activeTab === "won" ? t("empty.won") : 
                      t("empty.past")}
                    </p>
                  </div>
                </div>
            )}
        </div>
    );
}
