"use client";

import { useState } from "react";
import {
  History, Calendar,
  Download, ChevronLeft, ChevronRight,
  Activity, Wallet, Gavel, X, Check,
  Filter,
  User
} from "lucide-react";

import { cn, formatDate } from "@/lib/utils";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// Hooks
import { useAuditLogs } from "@/hooks/useAudit";
import { useCurrency } from "@/hooks/useCurrency";

// UI Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { IAuditLogFilters } from "@/types/audit";


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
  const t = useTranslations("admin_audit_logs");
  const commonT = useTranslations("common");
  const { id } = useParams();
  const { formatCurrency, symbol } = useCurrency();

  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<IAuditLogFilters>({
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

  const columns = [
    { key: "timestamp", label: t('table.timestamp'), width: "w-32" },
    { key: "action", label: t('table.action'), width: "w-24" },
    { key: "user", label: t('table.user'), width: "w-40" },
    { key: "details", label: t('table.details'), width: "w-64" },
  ];

  const handleExportCSV = () => {
    if (!logs.length) return;

    // CSV Headers
    const headers = ["Timestamp", "Action", "User Name", "User Email", "Details"];

    // Format rows
    const rows = logs.map(log => {
      const timestamp = formatDate(log.createdAt);

      const action = t(`actions.${log.action}`);
      const userName = log.userId?.name || "Unknown";
      const userEmail = log.userId?.email || "N/A";

      // Simple metadata summary for CSV
      let details = "";
      if (log.metadata) {
        if (log.metadata.type) details += `[${log.metadata.type}] `;
        if (log.metadata.amount) details += `Amount: ${symbol}${log.metadata.amount} `;
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
    link.setAttribute("download", `audit_logs_${new Date().getTime()}.csv`);

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
          <p className="text-gray-400">{t('metadata.fundsLocked', { amount: formatCurrency(metadata.amount) })}</p>
          {metadata.reason && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.reason })}</p>}
        </div>
      );
    }

    if (metadata.type === "UNLOCKED_FUNDS") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-400">{t('metadata.fundsUnlocked', { amount: formatCurrency(metadata.amount) })}</p>
          {metadata.reason && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.reason })}</p>}
        </div>
      );
    }

    if (metadata.type === "AUCTION_SETTLEMENT_PAYMENT") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-400 font-medium text-red-400/80">{t('metadata.auctionPayment', { amount: formatCurrency(metadata.amount) })}</p>
          <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
        </div>
      );
    }

    if (metadata.type === "AUCTION_SETTLEMENT_RECEIPT") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-400 font-medium text-emerald-400/80">{t('metadata.auctionReceipt', { amount: formatCurrency(metadata.amount) })}</p>
          <p className="text-gray-500 italic">{metadata.auctionTitle}</p>
        </div>
      );
    }

    if (metadata.type === "DEPOSIT_APPROVED") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-emerald-400 font-medium">{t('metadata.depositApproved', { amount: formatCurrency(metadata.amount) })}</p>
          {metadata.newBalance && <p className="text-gray-500">{t('metadata.newBalance', { amount: formatCurrency(metadata.newBalance) })}</p>}
        </div>
      );
    }

    if (metadata.type === "PAYOUT_APPROVED") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-amber-400 font-medium">{t('metadata.payoutApproved', { amount: formatCurrency(metadata.amount) })}</p>
          {metadata.newLockedBalance !== undefined && <p className="text-gray-500 text-[10px]">{t('metadata.remainingLocked', { amount: formatCurrency(metadata.newLockedBalance) })}</p>}
        </div>
      );
    }

    if (metadata.type === "PAYOUT_REJECTED") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-red-400 font-medium">{t('metadata.payoutRejected', { amount: formatCurrency(metadata.amount) })}</p>
          {metadata.note && <p className="text-gray-500 italic">{t('metadata.reason', { reason: metadata.note })}</p>}
        </div>
      );
    }

    if (metadata.type === "MANUAL_ADJUSTMENT") {
      return (
        <div className="text-xs space-y-1">
          <p className="text-indigo-400 font-medium">{t('metadata.manualAdjustment', { type: metadata.adjustmentType, amount: formatCurrency(metadata.amount) })}</p>
          <p className="text-gray-500 italic">{t('metadata.note', { note: metadata.note })}</p>
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
            {metadata.newValue ? t('metadata.walletFrozen') : t('metadata.walletUnfrozen')}
          </p>
        </div>
      );
    }

    if (metadata.auctionId) {
      return (
        <div className="text-xs space-y-1">
          <p className="text-gray-400">{t('metadata.auction', { title: metadata.auctionTitle || metadata.title })}</p>
          {metadata.amount && <p className="text-gray-400">{t('metadata.bidAmount', { amount: formatCurrency(metadata.amount) })}</p>}
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
        title={t('title')}
        subtitle={t('subtitle')}
        statusLabel={t('statusLabel')}
        statusValue={t('statusValue')}
      >
        <button
          onClick={handleExportCSV}
          disabled={!logs.length || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-4 h-4" />
          {t('exportCsv')}
        </button>
      </DashboardHeader>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">

        {/* Action Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">{t('filters.eventType')}</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
            >
              <option className="bg-[#0f1115] text-white" value="all">{t('filters.allEvents')}</option>
              <option className="bg-[#0f1115] text-white" value="BID_PLACED">{t('filters.bidPlacement')}</option>
              <option className="bg-[#0f1115] text-white" value="AUCTION_CREATED">{t('filters.auctionCreation')}</option>
              <option className="bg-[#0f1115] text-white" value="WALLET_UPDATED">{t('filters.walletChanges')}</option>
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">{t('filters.fromDate')}</label>
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
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">{t('filters.toDate')}</label>
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
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <TableSkeleton cols={columns.map(c => c.width)} rows={5} />
              ) : logs.length === 0 ? (

                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">{t('table.noLogs')}</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const label = t(`actions.${log.action}`);
                  const config = ACTION_MAP[log.action] || { icon: Activity, color: "text-gray-400 bg-gray-400/10" };
                  const Icon = config.icon;

                  return (
                    <tr key={log._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{formatDate(log.createdAt, "date")}</div>
                        <div className="text-xs text-gray-500">{formatDate(log.createdAt, "time")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {label}
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
              {t('pagination.page', { current: page, total: totalPages })}
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
