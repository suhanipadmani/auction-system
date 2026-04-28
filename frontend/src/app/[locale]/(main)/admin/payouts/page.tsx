"use client";

import { useState } from "react";
import {
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon
} from "lucide-react";

// Hooks
import { usePendingPayouts, useProcessPayout } from "@/hooks/useWallet";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { TRANSACTION_STATUSES } from "@/enums";


import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";


export default function AdminPayoutsPage() {
  const t = useTranslations("payouts");
  const commonT = useTranslations("wallet");
  const { locale } = useParams();
  const { formatCurrency } = useCurrency();

  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { data: payoutsData, isLoading } = usePendingPayouts(statusFilter, page, 10);
  const processPayout = useProcessPayout();

  const columns = [
    { key: "user", label: t('table.user'), className: "w-[250px]", skeletonWidth: "w-40" },
    { key: "amount", label: t('table.amount'), skeletonWidth: "w-24" },
    { key: "date", label: t('table.requestedDate'), skeletonWidth: "w-32" },
    { key: "status", label: t('table.status'), skeletonWidth: "w-20" },
    { key: "actions", label: t('table.actions'), className: "text-right", skeletonWidth: "w-16" },
  ];


  const totalPages = (payoutsData as any)?.totalPages || 1;

  const handleProcess = (requestId: string, status: TRANSACTION_STATUSES.APPROVED | TRANSACTION_STATUSES.REJECTED) => {
    const adminNote = window.prompt(
      status === "approved"
        ? t('modals.addNote')
        : t('modals.rejectReason')
    );

    if (status === "rejected" && !adminNote) {
      alert(t('modals.rejectionRequired'));
      return;
    }
    processPayout.mutate({ requestId, status, adminNote: adminNote || "" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {["pending", "approved", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status === "all" ? "" : status);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${(status === "all" ? statusFilter === "" : statusFilter === status)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-border/50">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSkeleton cols={columns.map(c => c.skeletonWidth)} rows={5} />
              ) : payoutsData?.data?.length === 0 ? (

                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground/30" />
                      <p>{t('table.noRequests')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payoutsData?.data?.map((payout: any) => (
                  <TableRow key={payout._id} className="border-border/40 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{payout.userId?.name}</span>
                          <span className="text-[10px] text-muted-foreground">{payout.userId?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                        <span className="font-bold text-lg">{formatCurrency(payout.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(payout.createdAt, "full", locale as string)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payout.status === "approved" ? "default" :
                            payout.status === "pending" ? "outline" :
                              "destructive"
                        }
                        className="capitalize text-[10px] font-bold tracking-wider"
                      >
                        {t(payout.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === "pending" ? (
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleProcess(payout._id, TRANSACTION_STATUSES.REJECTED)}
                            disabled={processPayout.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => handleProcess(payout._id, TRANSACTION_STATUSES.APPROVED)}
                            disabled={processPayout.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground">
                          {t('table.processed', { date: formatDate(payout.updatedAt, "full", locale as string) })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={payoutsData?.total || 0}
            showingCount={payoutsData?.data?.length || 0}
            onPageChange={setPage}
            typeLabel={t('pagination.requests')}
          />

        </CardContent>
      </Card>

      {/* Disclaimer Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start">
        <Clock className="h-6 w-6 text-amber-500 mt-1 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-400 font-heading tracking-wide uppercase">{t('notice.title')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('notice.content')}
          </p>
        </div>
      </div>
    </div>
  );
}
