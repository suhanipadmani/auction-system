"use client";

import { useState, useEffect } from "react";
// External
import { Loader2, ClipboardList, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
// Hooks
import { useAuctions, useAdminApprove } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";
// Types
import { IApprovalTableProps, IInventoryTableProps } from "@/types/components";
import { AdminTab } from "@/types/auction";

// Constants
import { AUCTION_STATUS_OPTIONS } from "@/constants/auction.constants";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { AUCTION_STATUSES } from "@/enums";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { getApprovalColumns, getInventoryColumns } from "./columns";
import { useTranslations } from "next-intl";


export default function AdminAuctionManagementPage() {
  const t = useTranslations("admin_auctions");
  const { formatCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [inventoryPage, setInventoryPage] = useState<number>(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    auctionId: string | null;
    action: "approve" | "reject" | null;
  }>({
    isOpen: false,
    auctionId: null,
    action: null,
  });

  const { data: pendingResponse, isLoading: loadingPending } = useAuctions({
    status: AUCTION_STATUSES.PENDING,
    page: pendingPage,
    limit: 10
  });

  const { data: inventoryResponse, isLoading: loadingInventory } = useAuctions({
    status: statusFilter === "all" ? undefined : statusFilter as AUCTION_STATUSES,
    page: inventoryPage,
    limit: 10,
    search: debouncedSearch
  });

  const { mutate: approveReject, isPending: isProcessing } = useAdminApprove();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPendingPage(1);
      setInventoryPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  const handleAction = (id: string, action: "approve" | "reject") => {
    setConfirmModal({
      isOpen: true,
      auctionId: id,
      action
    });
  };

  const handleConfirmAction = () => {
    if (!confirmModal.auctionId || !confirmModal.action) return;

    approveReject(
      { id: confirmModal.auctionId, action: confirmModal.action },
      {
        onSuccess: () => {
          toast.success(t('modals.success', { action: confirmModal.action === "approve" ? "approved" : "rejected" }));
          setConfirmModal({ isOpen: false, auctionId: null, action: null });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || `Failed to ${confirmModal.action} auction`);
        }
      }
    );
  };

  const inventoryData = inventoryResponse?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <DashboardHeader
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Tab Navigation */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full md:w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
              activeTab === "pending"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <ClipboardList className="w-4 h-4" />
            {t('tabs.pending')}
            {pendingResponse?.data?.length ? (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
                {pendingResponse.data.length}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
              activeTab === "history"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <ClipboardList className="w-4 h-4" />
            {t('tabs.inventory')}
          </button>
        </div>

        {activeTab === "history" && (
          <div className="flex gap-4 w-full md:w-fit">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-white/5 border-white/10 h-12 rounded-2xl"
            />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-white/5 border-white/10 text-white">
                <SelectValue placeholder={t('statusFilter.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {AUCTION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {activeTab === "pending" ? (
          loadingPending ? (
            <TableSkeleton cols={["w-40", "w-24", "w-32", "w-20", "w-16"]} rows={5} />
          ) : !pendingResponse?.data?.length ? (

            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
              <ClipboardList className="w-12 h-12 opacity-20" />
              <p>{t('empty.pending')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ApprovalTable
                data={pendingResponse?.data || []}
                onAction={handleAction}
                isProcessing={isProcessing}
                t={t}
                formatCurrency={formatCurrency}
              />

              <Pagination
                currentPage={pendingPage}
                totalPages={pendingResponse?.totalPages || 1}
                totalItems={pendingResponse?.total || 0}
                showingCount={pendingResponse?.data?.length || 0}
                onPageChange={setPendingPage}
                typeLabel={t('pagination.pending')}
              />

            </div>
          )
        ) : (
          loadingInventory ? (
            <TableSkeleton cols={["w-40", "w-24", "w-32", "w-20", "w-16"]} rows={5} />
          ) : !inventoryData?.length ? (

            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
              <Search className="w-12 h-12 opacity-20" />
              <p>{t('empty.inventory')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <InventoryTable data={inventoryData} t={t} formatCurrency={formatCurrency} />

              <Pagination
                currentPage={inventoryPage}
                totalPages={inventoryResponse?.totalPages || 1}
                totalItems={inventoryResponse?.total || 0}
                showingCount={inventoryData.length}
                onPageChange={setInventoryPage}
                typeLabel={t('pagination.auctions')}
              />

            </div>
          )
        )}
      </div>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
        title={confirmModal.action === "approve" ? t('modals.approveTitle') : t('modals.rejectTitle')}
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
              disabled={isProcessing}
            >
              {t('modals.cancel')}
            </Button>
            <Button
              variant={confirmModal.action === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              isLoading={isProcessing}
              disabled={isProcessing}
            >
              {isProcessing ? t('modals.processing') : confirmModal.action === "approve" ? t('modals.confirmApproval') : t('modals.confirmRejection')}
            </Button>
          </div>
        }
      >
        <p className="text-gray-300">
          {t('modals.confirmAction', { action: confirmModal.action || "" })}
          {confirmModal.action === "approve" ? t('modals.approveEffect') : t('modals.rejectEffect')}
        </p>
      </Modal>
    </div>
  );
}


function ApprovalTable({ data, onAction, isProcessing, t, formatCurrency }: IApprovalTableProps) {
  const columns = getApprovalColumns(onAction, isProcessing, t, formatCurrency);
  return (
    <Table>
      <TableHeader className="bg-black/25">
        <TableRow className="hover:bg-transparent border-white/5 text-gray-400">
          {columns.map((col: any, idx: number) => (
            <TableHead key={idx} className={col.headerClassName}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((auction) => (
          <TableRow key={auction._id} className="border-white/5 hover:bg-white/[0.05] transition-colors">
            {columns.map((col: any, idx: number) => (
              <TableCell key={idx} className={col.className}>
                {col.render(auction)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InventoryTable({ data, t, formatCurrency }: IInventoryTableProps) {
  const columns = getInventoryColumns(t, formatCurrency);
  return (
    <Table>
      <TableHeader className="bg-black/25">
        <TableRow className="hover:bg-transparent border-white/5 text-gray-400">
          {columns.map((col: any, idx: number) => (
            <TableHead key={idx} className={col.headerClassName}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((auction) => (
          <TableRow key={auction._id} className="border-white/5 hover:bg-white/[0.05] transition-colors">
            {columns.map((col: any, idx: number) => (
              <TableCell key={idx} className={col.className}>
                {col.render(auction)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
