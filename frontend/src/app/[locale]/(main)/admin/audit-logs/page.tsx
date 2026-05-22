"use client";

import { useState } from "react";
import {
  History,
  Download,
  Activity,
  Filter,
  User,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Hooks
import { useAuditLogs } from "@/hooks/useAudit";
import { useCurrency } from "@/hooks/useCurrency";
import { auditApi } from "@/api/audit.api";
import { IAuditLog, IAuditLogPageFilters } from "@/types/audit";

// UI Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { DatePicker } from "@/components/ui/DatePicker";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Card, CardContent } from "@/components/ui/Card";

// New Components & Constants
import { AuditLogDetails } from "@/components/admin/audit/AuditLogDetails";
import { AUDIT_ACTIONS, ACTION_MAP } from "@/constants/audit.constants";
import { downloadCSV } from "@/utils/csv.utils";

export default function AuditLogsPage() {
  const t = useTranslations("admin_audit_logs");
  const { symbol } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<IAuditLogPageFilters>({
    action: "all",
    startDate: undefined,
    endDate: undefined,
  });

  const { data: logsResponse, isLoading, error } = useAuditLogs({
    ...filters,
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
    page,
    limit: 20,
  });

  const logs = logsResponse?.data || [];
  const totalPages = logsResponse?.totalPages || 1;
  const totalItems = logsResponse?.total || 0;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); 
  };

  const columns = [
    { key: "timestamp", label: t('table.timestamp'), width: "w-32" },
    { key: "action", label: t('table.action'), width: "w-24" },
    { key: "user", label: t('table.user'), width: "w-40" },
    { key: "details", label: t('table.details'), width: "w-64" },
  ];

  const handleExportCSV = async () => {
    if (isLoading || isExporting) return;
    setIsExporting(true);

    try {
      // Fetch all pages for the current filters
      let allLogs: IAuditLog[] = [];
      let currentPage = 1;
      let totalPagesCount = 1;
      const EXPORT_LIMIT = 1000;

      do {
        const response = await auditApi.getLogs({
          ...filters,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
          page: currentPage,
          limit: EXPORT_LIMIT
        });
        
        if (response?.data) {
          allLogs = [...allLogs, ...response.data];
        }
        
        totalPagesCount = response?.totalPages || 1;
        currentPage++;
        if (currentPage > 100) break; 
      } while (currentPage <= totalPagesCount);

      if (!allLogs.length) {
        toast.error(t('noLogsToExport') || "No logs found to export");
        return;
      }

      // CSV Headers
      const headers = ["Timestamp", "Action", "User Name", "User Email", "Details"];

      // Format rows
      const rows = allLogs.map((log: IAuditLog) => {
        const timestamp = formatDate(log.createdAt);
        const action = t(`actions.${log.action}`);
        const userName = log.userId?.name || "Unknown";
        const userEmail = log.userId?.email || "N/A";

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
          `"${details.trim().replace(/\n/g, ' ')}"`
        ];
      });

      downloadCSV(headers, rows, "audit_logs");
      toast.success(t('exportSuccess') || "CSV exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(t('exportError') || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
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
          disabled={!logs.length || isLoading || isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[120px] justify-center"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? t('exporting') || "Exporting..." : t('exportCsv')}
        </button>
      </DashboardHeader>

      {/* Filters Bar */}
      <div className="relative isolate z-10 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">

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
              <option className="bg-[#0f1115] text-white" value={AUDIT_ACTIONS.BID_PLACED}>{t('filters.bidPlacement')}</option>
              <option className="bg-[#0f1115] text-white" value={AUDIT_ACTIONS.AUCTION_CREATED}>{t('filters.auctionCreation')}</option>
              <option className="bg-[#0f1115] text-white" value={AUDIT_ACTIONS.WALLET_UPDATED}>{t('filters.walletChanges')}</option>
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">{t('filters.fromDate')}</label>
          <DatePicker
            value={filters.startDate}
            onChange={(date) => handleFilterChange("startDate", date)}
            placeholder={t('filters.fromDate')}
            className="w-full"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">{t('filters.toDate')}</label>
          <DatePicker
            value={filters.endDate}
            onChange={(date) => handleFilterChange("endDate", date)}
            placeholder={t('filters.toDate')}
            className="w-full"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4 max-w-2xl mx-auto shadow-lg">
          <Activity className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">
              {(error as any)?.response?.status === 429 ? "Too Many Requests" : "Failed to Load Logs"}
            </h3>
            <p className="text-sm opacity-80 mt-1">
              {(error as any)?.response?.status === 429 
                ? "You're moving a bit fast! Please wait a moment." 
                : "There was an error loading the audit logs. Please check your permissions."}
            </p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {!error && (
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSkeleton cols={columns.map(c => c.width)} rows={5} />
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-40">
                    <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">{t('table.noLogs')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const label = t(`actions.${log.action}`);
                  const config = ACTION_MAP[log.action] || { icon: Activity, color: "text-gray-400 bg-gray-400/10" };
                  const Icon = config.icon;

                  return (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="text-sm text-gray-300">{formatDate(log.createdAt, "date")}</div>
                        <div className="text-xs text-gray-500">{formatDate(log.createdAt, "time")}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                            <User className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{log.userId?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{log.userId?.email || "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <AuditLogDetails metadata={log.metadata} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            showingCount={logs.length}
            onPageChange={setPage}
            typeLabel={t('pagination.logs') || t('table.logs')}
          />
        </CardContent>
      </Card>
      )}
    </div>
  );
}
