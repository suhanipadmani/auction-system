"use client";

import { useState } from "react";
import { useAllTransactions } from "@/hooks/useWallet";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { History, Search } from "lucide-react";

// Common & Modular Components
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
import { ITransaction } from "@/types/wallet";

export function TransactionLogSection() {
  const [txType, setTxType] = useState<string>("all");
  const [txSearch, setTxSearch] = useState("");
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");

  const { data: allTransactionsData, isLoading: isAllTransactionsLoading } = useAllTransactions({
    type: txType,
    search: txSearch,
    startDate: txStartDate,
    endDate: txEndDate
  });

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
              <Select value={txType} onValueChange={(val: string | null) => setTxType(val || "all")}>
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
        </CardContent>
      </Card>
    </div>
  );
}
