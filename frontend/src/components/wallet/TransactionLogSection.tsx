"use client";

import { useEffect, useState } from "react";
import { History, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Types
import { ITransaction } from "@/types/wallet";

// Hooks
import { useAllTransactions } from "@/hooks/useWallet";
import { useDebounce } from "@/hooks/useDebounce";
import { TRANSACTION_TYPES } from "@/enums";

// Components
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { TransactionLogRow } from "./TransactionLogRow";
import { Dropdown } from "@/components/ui/Dropdown";
import { DatePicker } from "@/components/ui/DatePicker";
import { useTranslations } from "next-intl";

export function TransactionLogSection() {
  const t = useTranslations("wallet");
  const [txType, setTxType] = useState<string>("all");
  const [txSearch, setTxSearch] = useState<string>("");
  const [txStartDate, setTxStartDate] = useState<Date | undefined>(undefined);
  const [txEndDate, setTxEndDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const debouncedSearch = useDebounce(txSearch, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, txType, txStartDate, txEndDate]);

  const { data: allTransactionsData, isLoading: isAllTransactionsLoading } = useAllTransactions({
    type: txType,
    search: debouncedSearch,
    startDate: txStartDate?.toISOString(),
    endDate: txEndDate?.toISOString(),
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
      return <EmptyState message={t('noTransactions')} colSpan={7} />;
    }

    return transactions.map((tx) => (
      <TransactionLogRow key={tx._id} tx={tx} />
    ));
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-visible min-h-[450px] relative z-10">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 mb-4">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            {t('globalLog')}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {t('liveAudit')}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 relative z-20">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('searchUser')}</label>
              <form onSubmit={(e) => e.preventDefault()}>
                <Input
                  placeholder="Name or email..."
                  value={txSearch}
                  onChange={(e) => {
                    setTxSearch(e.target.value);
                  }}
                  icon={<Search className="h-3.5 w-3.5" />}
                  className="h-9 text-xs bg-background/50"
                />
              </form>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('transactionType')}</label>
              <Dropdown
                value={txType}
                onChange={(val: string) => {
                  setTxType(val || "all");
                }}
                options={[
                  { label: t('allTypes'), value: "all" },
                  { label: t('txTypes.credit'), value: TRANSACTION_TYPES.CREDIT },
                  { label: t('txTypes.debit'), value: TRANSACTION_TYPES.DEBIT },
                  { label: t('txTypes.lock'), value: TRANSACTION_TYPES.LOCK },
                  { label: t('txTypes.unlock'), value: TRANSACTION_TYPES.UNLOCK },
                ]}
                placeholder={t('allTypes')}
                triggerClassName="h-9 text-xs bg-background/50 border-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('fromDate')}</label>
              <DatePicker
                value={txStartDate}
                onChange={(date) => {
                  setTxStartDate(date);
                }}
                placeholder="From..."
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('toDate')}</label>
              <DatePicker
                value={txEndDate}
                onChange={(date) => {
                  setTxEndDate(date);
                }}
                placeholder="To..."
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden bg-background/30 shadow-inner">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="py-4">{t('table.user')}</TableHead>
                  <TableHead className="py-4">{t('table.type')}</TableHead>
                  <TableHead className="py-4">{t('table.amount')}</TableHead>
                  <TableHead className="py-4">{t('table.source')}</TableHead>
                  <TableHead className="py-4">{t('table.actionBy')}</TableHead>
                  <TableHead className="py-4">{t('table.date')}</TableHead>
                  <TableHead className="text-right py-4">{t('table.status')}</TableHead>
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
