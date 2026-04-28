"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// External
import { Loader2, Plus, ChevronLeft, ChevronRight, Search, ListFilter } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Types
import { AuctionStatus } from "@/types/auction";

import { useAuctions } from "@/hooks/useAuction";
import { useTranslations } from "next-intl";

// Utils
import { cn } from "@/lib/utils";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export default function SellerAuctionsPage() {
  const t = useTranslations("auction.management");
  const user = useAuthStore((state) => state.user);

  const [status, setStatus] = useState<AuctionStatus | "all">("all");
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<string>("createdAt-desc");

  const [sortBy, sortOrder] = sortConfig.split("-");
  const { data: response, isLoading } = useAuctions({ 
    sellerId: user?._id,
    status: status === "all" ? undefined : status,
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc"
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  const auctions = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalItems = response?.total || 0;

  const TABS = [
    { id: "all", label: t("tabs.all") },
    { id: "active", label: t("tabs.active") },
    { id: "pending", label: t("tabs.pending") },
    { id: "past", label: t("tabs.past") },
  ] as const;


  const handleStatusChange = (newStatus: AuctionStatus | "all") => {
    setStatus(newStatus);
    setPage(1); // Reset to first page on status change
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <Link
          href="/seller/create"
          className={cn(buttonVariants({ variant: "default" }), "bg-indigo-600 hover:bg-indigo-700")}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("createListing")}
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
             <Input
               placeholder={t("searchPlaceholder")}
               value={search}
               onChange={(e) => {
                 setSearch(e.target.value);
                 setPage(1);
               } }
               className="h-10 bg-white/5 border-white/10 pl-10"
               icon={<Search className="w-4 h-4 text-gray-500" />}
             />
          </div>

          <Select value={sortConfig} onValueChange={(val) => {
            if (val) setSortConfig(val);
            setPage(1);
          }}>
            <SelectTrigger className="h-10 w-full sm:w-44 bg-white/5 border-white/10 text-gray-300">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder={t("sortBy")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">{t("sort.newest")}</SelectItem>
              <SelectItem value="createdAt-asc">{t("sort.oldest")}</SelectItem>
              <SelectItem value="basePrice-desc">{t("sort.priceHigh")}</SelectItem>
              <SelectItem value="basePrice-asc">{t("sort.priceLow")}</SelectItem>
              <SelectItem value="highestBid-desc">{t("sort.bidHigh")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-muted-foreground mb-4">
            {status === "all" ? t("empty") : t("emptyStatus", { status: t(`tabs.${status}`) })}
          </p>
          {status === "all" && (
            <Link
              href="/seller/create"
              className={buttonVariants({ variant: "outline" })}
            >
              {t("startFirstListing")}
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
                    {t("pagination.info", { count: auctions.length, total: totalItems })}
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-white/10 text-gray-300"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> {t("pagination.previous")}
                    </Button>
                    <div className="text-sm text-gray-400 px-2 font-medium">
                        {t("page", { current: page, total: totalPages })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="border-white/10 text-gray-300"
                    >
                        {t("pagination.next")} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
