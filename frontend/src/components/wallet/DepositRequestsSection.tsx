"use client";

import { useState } from "react";
import { ArrowUpCircle, ChevronLeft, ChevronRight, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Types
import { IDepositRequestsSectionProps, IPageColumn } from "@/types/components";
import { IDepositRequest } from "@/types/wallet";

// Hooks
import { usePendingDeposits, useProcessDeposit } from "@/hooks/useWallet";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";
import { TRANSACTION_STATUSES } from "@/enums";
import { formatDate } from "@/lib/utils";

export function DepositRequestsSection({ onProcessClick, processingId }: IDepositRequestsSectionProps) {
  const t = useTranslations("wallet");
  const [depositFilter, setDepositFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [page, setPage] = useState<number>(1);
  const { data: pendingData, isLoading: isPendingLoading } = usePendingDeposits(depositFilter, page, 20);
  const processDeposit = useProcessDeposit();
  const { formatCurrency } = useCurrency();

  const totalPages = (pendingData as any)?.totalPages || 1;
  const totalItems = (pendingData as any)?.total || 0;

  const columns: IPageColumn<IDepositRequest>[] = [
    {
      key: "user",
      label: t('table.user'),
      render: (req) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {req.userId?.name?.[0] || '?'}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{req.userId?.name}</span>
            <span className="text-[10px] text-muted-foreground">{req.userId?.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: t('table.amount'),
      render: (req) => (
        <span className="font-bold text-emerald-400">{formatCurrency(req.amount)}</span>
      ),
    },
    {
      key: "date",
      label: t('requestedAt'),
      render: (req) => (
        <span className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</span>
      ),
    },
    {
      key: "status",
      label: t('status'),
      render: (req) => (
        <Badge
          variant="outline"
          className={`capitalize text-[10px] h-5 ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
        >
          {t(`statuses.${req.status}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t('actions'),
      align: "right",
      render: (req) => (
        <div className="flex justify-end gap-2">
          {req.status === 'pending' ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-full"
                onClick={() => onProcessClick(req, TRANSACTION_STATUSES.REJECTED)}
                title={t('modals.reject')}
                disabled={processDeposit.isPending}
              >
                <XCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 rounded-full"
                onClick={() => onProcessClick(req, TRANSACTION_STATUSES.APPROVED)}
                title={t('modals.approve')}
                disabled={processDeposit.isPending}
                isLoading={processingId === req._id && processDeposit.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[10px] text-muted-foreground"
              disabled
            >
              {t(`statuses.${req.status}`)}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderTableBody = () => {
    if (isPendingLoading) {
      return <TableSkeleton rows={5} columns={columns.length} />;
    }

    const requests = pendingData?.data as IDepositRequest[];

    if (!requests || requests.length === 0) {
      return <EmptyState message={`${t('depositRequests')} - ${t(`statuses.${depositFilter}`)}`} colSpan={columns.length} />;
    }

    return requests.map((req) => (
      <TableRow key={req._id} className="border-border/40 hover:bg-white/5 transition-colors group">
        {columns.map((col) => (
          <TableCell
            key={col.key}
            className={`py-4 ${col.align === "right" ? "text-right" : ""}`}
          >
            {col.render(req)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
              {t('depositRequests')}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t('depositRequestsDesc')}</p>
          </div>

          <div className="flex p-1 bg-background/50 rounded-xl border border-border/50 w-fit">
            {(['pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setDepositFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${depositFilter === status
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-white'
                  }`}
              >
                {t(`statuses.${status}`)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-border/40">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={`py-4 ${col.key === 'user' ? 'w-[250px]' : ''} ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Showing <span className="text-white">{(pendingData?.data as any[])?.length || 0}</span> of <span className="text-white">{totalItems}</span> requests
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-muted-foreground hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-medium text-gray-500">
                  Page <span className="text-primary">{page}</span> of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-muted-foreground hover:text-white"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
