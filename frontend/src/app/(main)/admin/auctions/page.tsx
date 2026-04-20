"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// External
import { Loader2, Check, X, Eye, History, ClipboardList, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Hooks
import { useAuctions, useAdminApprove, useAdminInventory } from "@/hooks/useAuction";
import { useAuctionStatus } from "@/hooks/useAuctionStatus";

// Types
import { IAuction, AuctionStatus } from "@/types/auction";

// Constants
import { AUCTION_STATUS_OPTIONS } from "@/constants/auction.constants";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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

// Table Config
import { getApprovalColumns, getInventoryColumns } from "./columns";

type AdminTab = "pending" | "history";

export default function AdminAuctionManagementPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingPage, setPendingPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPendingPage(1);
      setInventoryPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    status: "pending" as any,
    page: pendingPage,
    limit: 10
  });
  const { data: historyResponse, isLoading: loadingHistory } = useAdminInventory({ 
    status: statusFilter === "all" ? undefined : statusFilter as any,
    search: debouncedSearch || undefined,
    page: inventoryPage,
    limit: 10
  });
  
  const { mutate: approve, isPending: isApproving } = useAdminApprove();

  const handleAction = (id: string, action: "approve" | "reject") => {
    setConfirmModal({
      isOpen: true,
      auctionId: id,
      action
    });
  };

  const handleConfirmAction = () => {
    if (!confirmModal.auctionId || !confirmModal.action) return;

    approve(
      { id: confirmModal.auctionId, action: confirmModal.action },
      {
        onSuccess: () => {
          toast.success(`Auction ${confirmModal.action === "approve" ? "approved" : "rejected"} successfully`);
          setConfirmModal({ isOpen: false, auctionId: null, action: null });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || `Failed to ${confirmModal.action} auction`);
        }
      }
    );
  };

  const inventoryData = historyResponse?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <DashboardHeader
        title="Auction Management"
        subtitle="Review approvals and monitor global auction inventory."
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
            Pending Review
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
            Global Inventory
          </button>
        </div>

        {activeTab === "history" && (
           <div className="flex gap-4 w-full md:w-fit">
              <Input 
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="bg-white/5 border-white/10 h-12 rounded-2xl"
              />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Status" />
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
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !pendingResponse?.data?.length ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
              <ClipboardList className="w-12 h-12 opacity-20" />
              <p>No auctions pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ApprovalTable 
                  data={pendingResponse?.data || []} 
                  onAction={handleAction} 
                  isProcessing={isApproving}
              />
              
              {/* Pending Pagination UI */}
              {pendingResponse?.totalPages && pendingResponse.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-t border-white/5">
                  <p className="text-sm text-gray-500">
                    Showing <span className="text-white font-medium">{pendingResponse.data.length}</span> of <span className="text-white font-medium">{pendingResponse?.total || 0}</span> pending
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                      disabled={pendingPage === 1}
                      className="border-white/10 text-gray-400 h-9"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-gray-400 px-2 font-medium">
                      Page <span className="text-white font-bold">{pendingPage}</span> of {pendingResponse.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingPage(p => Math.min(pendingResponse.totalPages || 1, p + 1))}
                      disabled={pendingPage === pendingResponse.totalPages}
                      className="border-white/10 text-gray-400 h-9"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          loadingHistory ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !inventoryData?.length ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
              <Search className="w-12 h-12 opacity-20" />
              <p>No auctions found in inventory</p>
            </div>
          ) : (
            <div className="space-y-4">
              <InventoryTable data={inventoryData} />
              
              {/* History Pagination UI */}
              {historyResponse?.totalPages && historyResponse.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-t border-white/5">
                  <p className="text-sm text-gray-500">
                    Showing <span className="text-white font-medium">{inventoryData.length}</span> of <span className="text-white font-medium">{historyResponse?.total || 0}</span> auctions
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                      disabled={inventoryPage === 1}
                      className="border-white/10 text-gray-400 h-9"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-sm text-gray-400 px-2 font-medium">
                      Page <span className="text-white font-bold">{inventoryPage}</span> of {historyResponse.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInventoryPage(p => Math.min(historyResponse.totalPages || 1, p + 1))}
                      disabled={inventoryPage === historyResponse.totalPages}
                      className="border-white/10 text-gray-400 h-9"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
        title={confirmModal.action === "approve" ? "Approve Auction" : "Reject Auction"}
        footer={
          <div className="flex gap-3 justify-end">
            <Button 
                variant="ghost" 
                onClick={() => setConfirmModal({ isOpen: false, auctionId: null, action: null })}
                disabled={isApproving}
            >
              Cancel
            </Button>
            <Button 
                variant={confirmModal.action === "approve" ? "default" : "destructive"}
                onClick={handleConfirmAction}
                isLoading={isApproving}
                disabled={isApproving}
            >
              {isApproving ? "Processing..." : confirmModal.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </div>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to <span className="font-bold text-white tracking-wide uppercase">{confirmModal.action}</span> this auction? 
          {confirmModal.action === "approve" ? " This will make the auction visible and allow bidding at the scheduled start time." : " This will permanently reject the request."}
        </p>
      </Modal>
    </div>
  );
}

function ApprovalTable({ data, onAction, isProcessing }: { data: IAuction[], onAction: any, isProcessing: boolean }) {
    const columns = getApprovalColumns(onAction, isProcessing);
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

function InventoryTable({ data }: { data: IAuction[] }) {
    const columns = getInventoryColumns();
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
