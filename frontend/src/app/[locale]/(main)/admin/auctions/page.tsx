"use client";

import { useState, useEffect } from "react";
// External
import { ClipboardList, Search } from "lucide-react";
import { toast } from "sonner";
// Hooks
import { useAuctions, useAdminApprove, useAdminInventory } from "@/hooks/useAuction";
import { useDebounce } from "@/hooks/useDebounce";
import { useCurrency } from "@/hooks/useCurrency";
// Types
import { IApprovalTableProps, IInventoryTableProps } from "@/types/components";
import { AdminTab, IAdminAuctionConfirmModal } from "@/types/auction";
// Constants
import { AUCTION_STATUS_OPTIONS } from "@/constants/auction.constants";

import { Card, CardContent } from "@/components/ui/Card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { AUCTION_STATUSES } from "@/enums";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";
import { getApprovalColumns, getInventoryColumns } from "./columns";
import { useTranslations } from "next-intl";

export default function AdminAuctionManagementPage() {
  const t = useTranslations("admin_auctions");
  const { formatCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [inventoryPage, setInventoryPage] = useState<number>(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [confirmModal, setConfirmModal] = useState<IAdminAuctionConfirmModal>({
    isOpen: false,
    auctionId: null,
    action: null,
  });

  const { data: pendingResponse, isLoading: loadingPending } = useAuctions({
    status: AUCTION_STATUSES.PENDING,
    page: pendingPage,
    limit: 10
  });

  const { data: inventoryResponse, isLoading: loadingInventory } = useAdminInventory({
    status: statusFilter === "all" ? undefined : statusFilter as AUCTION_STATUSES,
    page: inventoryPage,
    limit: 10,
    search: debouncedSearch
  });

  const { mutate: approveReject, isPending: isProcessing } = useAdminApprove();

  // Reset pages on search change
  useEffect(() => {
    setPendingPage(1);
    setInventoryPage(1);
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-white/5 border-white/10 h-12 rounded-2xl"
            />
            <Dropdown
              value={statusFilter}
              onChange={(val: string | null) => setStatusFilter(val || "all")}
              options={AUCTION_STATUS_OPTIONS}
              placeholder={t('statusFilter.placeholder')}
              triggerClassName="w-[180px] h-12 rounded-2xl bg-white/5 border-white/10 text-white"
            />
          </div>
        )}
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {activeTab === "pending" ? (
            loadingPending ? (
              <Table>
                <TableBody>
                  <TableSkeleton cols={["w-40", "w-24", "w-32", "w-20", "w-16"]} rows={5} />
                </TableBody>
              </Table>
            ) : !pendingResponse?.data?.length ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
                <ClipboardList className="w-12 h-12 opacity-20" />
                <p>{t('empty.pending')}</p>
              </div>
            ) : (
              <div className="space-y-0">
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
              <Table>
                <TableBody>
                  <TableSkeleton cols={["w-40", "w-24", "w-32", "w-20", "w-16"]} rows={5} />
                </TableBody>
              </Table>
            ) : !inventoryData?.length ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
                <Search className="w-12 h-12 opacity-20" />
                <p>{t('empty.inventory')}</p>
              </div>
            ) : (
              <div className="space-y-0">
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
        </CardContent>
      </Card>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
        title={confirmModal.action === "approve" ? t('modals.approveTitle') : t('modals.rejectTitle')}
        cancelText={t('modals.cancel')}
        confirmText={isProcessing ? t('modals.processing') : confirmModal.action === "approve" ? t('modals.confirmApproval') : t('modals.confirmRejection')}
        onCancel={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
        onConfirm={handleConfirmAction}
        isConfirmLoading={isProcessing}
        isDanger={confirmModal.action === "reject"}
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
      <TableHeader>
        <TableRow>
          {columns.map((col: any, idx: number) => (
            <TableHead key={idx} className={col.headerClassName}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((auction) => (
          <TableRow key={auction._id}>
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
      <TableHeader>
        <TableRow>
          {columns.map((col: any, idx: number) => (
            <TableHead key={idx} className={col.headerClassName}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((auction) => (
          <TableRow key={auction._id}>
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
