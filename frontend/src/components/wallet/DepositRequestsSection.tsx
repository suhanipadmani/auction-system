"use client";

import { useState } from "react";
import { ArrowUpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Types
import { IDepositRequestsSectionProps } from "@/types/components";
import { IDepositRequest } from "@/types/wallet";

// Hooks
import { usePendingDeposits, useProcessDeposit } from "@/hooks/useWallet";

// Components
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DepositRow } from "./DepositRow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/Table";



export function DepositRequestsSection({ onProcessClick, processingId }: IDepositRequestsSectionProps) {

  const [depositFilter, setDepositFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [page, setPage] = useState(1);
  const { data: pendingData, isLoading: isPendingLoading } = usePendingDeposits(depositFilter, page, 20);
  const processDeposit = useProcessDeposit();

  const totalPages = (pendingData as any)?.totalPages || 1;
  const totalItems = (pendingData as any)?.total || 0;

  const renderTableBody = () => {
    if (isPendingLoading) {
      return <TableSkeleton rows={5} columns={5} />;
    }

    const requests = pendingData?.data as IDepositRequest[];

    if (!requests || requests.length === 0) {
      return <EmptyState message={`No ${depositFilter} requests found`} colSpan={5} />;
    }

    return requests.map((req) => (
      <DepositRow
        key={req._id}
        req={req}
        onProcessClick={onProcessClick}
        isLoading={processDeposit.isPending}
        processingId={processingId}
      />
    ));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
              Deposit Requests
            </CardTitle>
            <p className="text-xs text-muted-foreground">Manage and audit user deposit requests.</p>
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
                {status}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-[250px] py-4">User</TableHead>
                  <TableHead className="py-4">Amount</TableHead>
                  <TableHead className="py-4">Requested At</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="text-right py-4">Actions</TableHead>
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
