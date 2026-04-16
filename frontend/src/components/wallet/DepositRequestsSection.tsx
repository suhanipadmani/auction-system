"use client";

import { useState } from "react";
import { ArrowUpCircle } from "lucide-react";

// Types
import { IDepositRequest } from "@/types/wallet";

// Hooks
import { usePendingDeposits, useProcessDeposit } from "@/hooks/useWallet";

// Components
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DepositRow } from "./DepositRow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/Table";

interface DepositRequestsSectionProps {
  onProcessClick: (req: IDepositRequest, type: "approved" | "rejected") => void;
  processingId?: string;
}

export function DepositRequestsSection({ onProcessClick, processingId }: DepositRequestsSectionProps) {
  const [depositFilter, setDepositFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const { data: pendingData, isLoading: isPendingLoading } = usePendingDeposits(depositFilter);
  const processDeposit = useProcessDeposit();

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
                onClick={() => setDepositFilter(status)}
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
        </CardContent>
      </Card>
    </div>
  );
}
