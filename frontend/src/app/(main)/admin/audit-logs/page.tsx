"use client";

import { useState } from "react";
import { 
  History, Filter, Calendar, 
  Download, ChevronLeft, ChevronRight,
  User, Activity, Wallet, Gavel, X, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Hooks
import { useAuditLogs } from "@/hooks/useAudit";

// UI Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const ACTION_MAP: Record<string, { label: string; icon: any; color: string }> = {
  BID_PLACED: { label: "Bid Placed", icon: Gavel, color: "text-blue-400 bg-blue-400/10" },
  BID_REMOVED: { label: "Bid Removed", icon: X, color: "text-red-400 bg-red-400/10" },
  AUCTION_CREATED: { label: "Auction Created", icon: Activity, color: "text-purple-400 bg-purple-400/10" },
  AUCTION_UPDATED: { label: "Auction Updated", icon: Activity, color: "text-amber-400 bg-amber-400/10" },
  AUCTION_CANCELLED: { label: "Auction Cancelled", icon: X, color: "text-red-400 bg-red-400/10" },
  WALLET_UPDATED: { label: "Wallet Change", icon: Wallet, color: "text-emerald-400 bg-emerald-400/10" },
  DEPOSIT_REQUESTED: { label: "Deposit Requested", icon: Download, color: "text-blue-400 bg-blue-400/10" },
  DEPOSIT_APPROVED: { label: "Deposit Approved", icon: Check, color: "text-emerald-400 bg-emerald-400/10" },
  DEPOSIT_REJECTED: { label: "Deposit Rejected", icon: X, color: "text-red-400 bg-red-400/10" },
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "all",
    startDate: "",
    endDate: "",
  });

  const { data: logsResponse, isLoading } = useAuditLogs({
    ...filters,
    page,
    limit: 20,
  });

  const logs = logsResponse?.data || [];
  const totalPages = logsResponse?.totalPages || 1;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleExportCSV = () => {
    if (!logs.length) return;

    // CSV Headers
    const headers = ["Timestamp", "Action", "User Name", "User Email", "Details"];
    
    // Format rows
    const rows = logs.map(log => {
      const timestamp = format(new Date(log.createdAt), "yyyy-MM-dd h:mm:ss a");
      const action = ACTION_MAP[log.action]?.label || log.action;
      const userName = log.userId?.name || "Unknown";
      const userEmail = log.userId?.email || "N/A";
      
      // Simple metadata summary for CSV
      let details = "";
      if (log.metadata) {
        if (log.metadata.type) details += `[${log.metadata.type}] `;
        if (log.metadata.amount) details += `Amount: ₹${log.metadata.amount} `;
        if (log.metadata.auctionTitle) details += `Auction: ${log.metadata.auctionTitle} `;
        if (log.metadata.reason) details += `Reason: ${log.metadata.reason} `;
        if (!details) details = JSON.stringify(log.metadata).replace(/"/g, '""');
      }

      return [
        `"${timestamp}"`,
        `"${action}"`,
        `"${userName}"`,
        `"${userEmail}"`,
        `"${details.trim()}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${format(new Date(), "yyyy_MM_dd_HHmm")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return null;
    
    // Custom rendering based on metadata type
    if (metadata.type === "LOCKED_FUNDS") {
       return (
         <div className="text-xs space-y-1">
            <p className="text-gray-400">Funds Locked: <span className="text-white font-medium">₹{metadata.amount}</span></p>
            <p className="text-gray-500 italic">{metadata.reason}</p>
         </div>
       );
    }

    if (metadata.type === "UNLOCKED_FUNDS") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-gray-400">Funds Unlocked: <span className="text-white font-medium">₹{metadata.amount}</span></p>
           <p className="text-gray-500 italic">{metadata.reason}</p>
        </div>
      );
   }

    if (metadata.type === "AUCTION_SETTLEMENT_PAYMENT") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-gray-400 font-medium text-red-400/80">Auction Payment: <span className="text-white">₹{metadata.amount}</span></p>
           <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
        </div>
      );
    }

    if (metadata.type === "AUCTION_SETTLEMENT_RECEIPT") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-gray-400 font-medium text-emerald-400/80">Auction Sale Receipt: <span className="text-white">₹{metadata.amount}</span></p>
           <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
        </div>
      );
    }

    if (metadata.type === "DEPOSIT_APPROVED") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-emerald-400 font-medium">Deposit Approved: <span className="text-white">₹{metadata.amount}</span></p>
           {metadata.newBalance && <p className="text-gray-500">New Balance: ₹{metadata.newBalance}</p>}
        </div>
      );
    }

    if (metadata.type === "PAYOUT_APPROVED") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-amber-400 font-medium">Payout Approved: <span className="text-white">₹{metadata.amount}</span></p>
           {metadata.newLockedBalance !== undefined && <p className="text-gray-500 text-[10px]">Remaining Locked: ₹{metadata.newLockedBalance}</p>}
        </div>
      );
    }

    if (metadata.type === "PAYOUT_REJECTED") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-red-400 font-medium">Payout Rejected: <span className="text-white">₹{metadata.amount}</span></p>
           {metadata.note && <p className="text-gray-500 italic">Reason: {metadata.note}</p>}
        </div>
      );
    }

    if (metadata.type === "MANUAL_ADJUSTMENT") {
      return (
        <div className="text-xs space-y-1">
           <p className="text-indigo-400 font-medium">Manual {metadata.adjustmentType}: <span className="text-white font-bold">₹{metadata.amount}</span></p>
           <p className="text-gray-500 italic">Note: {metadata.note}</p>
        </div>
      );
    }

    if (metadata.type === "WALLET_FREEZE_TOGGLE") {
      return (
        <div className="text-xs">
          <p className={cn(
            "font-black tracking-tight underline py-1",
            metadata.newValue ? "text-red-400" : "text-emerald-400"
          )}>
            WALLET {metadata.newValue ? "FROZEN" : "UNFROZEN"}
          </p>
        </div>
      );
    }

    if (metadata.auctionId) {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-400">Auction: <span className="text-white font-medium">{metadata.auctionTitle || metadata.title}</span></p>
          {metadata.amount && <p className="text-gray-400">Bid Amount: <span className="text-white">₹{metadata.amount}</span></p>}
        </div>
      );
    }

    return (
      <div className="text-[10px] text-gray-600 bg-black/20 p-2 rounded border border-white/5 font-mono break-all max-h-20 overflow-y-auto">
        {JSON.stringify(metadata, null, 2)}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <DashboardHeader
        title="Audit Logs"
        subtitle="System-wide activity and transaction history"
        statusLabel="Real-time"
        statusValue="Enabled"
      >
        <button 
          onClick={handleExportCSV}
          disabled={!logs.length || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </DashboardHeader>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        
        {/* Action Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Event Type</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
            >
              <option className="bg-[#0f1115] text-white" value="all">All Events</option>
              <option className="bg-[#0f1115] text-white" value="BID_PLACED">Bid Placement</option>
              <option className="bg-[#0f1115] text-white" value="AUCTION_CREATED">Auction Creation</option>
              <option className="bg-[#0f1115] text-white" value="WALLET_UPDATED">Wallet Changes</option>
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">From Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">To Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-64 bg-white/10 rounded" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">No audit logs found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const config = ACTION_MAP[log.action] || { label: log.action, icon: Activity, color: "text-gray-400 bg-gray-400/10" };
                  const Icon = config.icon;
                  
                  return (
                    <tr key={log._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{format(new Date(log.createdAt), "MMM d, yyyy")}</div>
                        <div className="text-xs text-gray-500">{format(new Date(log.createdAt), "h:mm:ss a")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{log.userId?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{log.userId?.email || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        {renderMetadata(log.metadata)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all underline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all underline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
