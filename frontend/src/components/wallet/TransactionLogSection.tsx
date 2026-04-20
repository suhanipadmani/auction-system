"use client";

import { useState } from "react";
import { History, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Types
import { ITransaction } from "@/types/wallet";

// Hooks
import { useAllTransactions } from "@/hooks/useWallet";

// Components
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { TransactionLogRow } from "./TransactionLogRow";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/Select";

export function TransactionLogSection() {
  const [txType, setTxType] = useState<string>("all");
  const [txSearch, setTxSearch] = useState("");
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");
  const [page, setPage] = useState(1);

  const { data: allTransactionsData, isLoading: isAllTransactionsLoading } = useAllTransactions({
    type: txType,
    search: txSearch,
    startDate: txStartDate,
    endDate: txEndDate,
    page,
    limit: 10
  });

  const totalPages = (allTransactionsData as any)?.totalPages || 1;
  const totalItems = (allTransactionsData as any)?.total || 0;

  const renderTableBody = () => {
    if (isAllTransactionsLoading) {
      return <TableSkeleton rows={8} columns={7} />;
    }

    const transactions = allTransactionsData?.data as ITransaction[];

    if (!transactions || transactions.length === 0) {
      return <EmptyState message="No system transactions recorded." colSpan={7} />;
    }

    return transactions.map((tx) => (
      <TransactionLogRow key={tx._id} tx={tx} />
    ));
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 mb-4">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            Global Transaction Log
          </CardTitle>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Live Audit
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Search User</label>
              <Input
                placeholder="Name or email..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                icon={<Search className="h-3.5 w-3.5" />}
                className="h-9 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Transaction Type</label>
              <Select value={txType} onValueChange={(val: string | null) => {
                setTxType(val || "all");
                setPage(1);
              }}>
                <SelectTrigger className="h-9 text-xs bg-background/50">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="lock">Lock</SelectItem>
                  <SelectItem value="unlock">Unlock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">From Date</label>
              <Input
                type="date"
                value={txStartDate}
                onChange={(e) => setTxStartDate(e.target.value)}
                className="h-9 text-xs bg-background/50 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">To Date</label>
              <Input
                type="date"
                value={txEndDate}
                onChange={(e) => setTxEndDate(e.target.value)}
                className="h-9 text-xs bg-background/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden bg-background/30 shadow-inner">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="py-4">User</TableHead>
                  <TableHead className="py-4">Type</TableHead>
                  <TableHead className="py-4">Amount</TableHead>
                  <TableHead className="py-4">Source</TableHead>
                  <TableHead className="py-4">Action By</TableHead>
                  <TableHead className="py-4">Date</TableHead>
                  <TableHead className="text-right py-4">Status</TableHead>
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
                Showing <span className="text-white">{(allTransactionsData?.data as any[])?.length || 0}</span> of <span className="text-white">{totalItems}</span> transactions
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
