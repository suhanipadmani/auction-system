"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";

// Hooks
import { useTransactions } from "@/hooks/useWallet";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";


export default function TransactionsPage() {
  const t = useTranslations("wallet.user");
  const tw = useTranslations("wallet");
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState<number>(1);

  const { data: transactionsData, isLoading } = useTransactions(page, 20);

  const totalPages = (transactionsData as any)?.totalPages || 1;




  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-9 w-9 p-0 rounded-full border border-border/50 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DashboardHeader
          title={t("transactionHistoryTitle")}
          subtitle={t("transactionHistorySubtitle")}
        />
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            {t("transactionHistoryHeader")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>{tw("table.type")}</TableHead>
                <TableHead>{tw("table.amount")}</TableHead>
                <TableHead>{tw("table.date")}</TableHead>
                <TableHead>{t("note")}</TableHead>
                <TableHead className="text-right">{tw("table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : transactionsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {t("noTransactions")}
                  </TableCell>
                </TableRow>
              ) : (
                transactionsData?.data?.map((tx: any) => (
                  <TableRow key={tx._id} className="border-border/40 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === "credit" && <ArrowUpCircle className="h-4 w-4 text-emerald-400" />}
                        {tx.type === "debit" && <ArrowDownCircle className="h-4 w-4 text-rose-400" />}
                        {tx.type === "lock" && <Lock className="h-4 w-4 text-amber-400" />}
                        {tx.type === "unlock" && <RefreshCcw className="h-4 w-4 text-indigo-400" />}
                        <span className="capitalize font-medium">{tw(`txTypes.${tx.type}`)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs italic max-w-[200px] truncate">
                      {tx.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={tx.status === "success" ? "default" : "destructive"} className="capitalize">
                        {tw(`statuses.${tx.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-border/40">
              <div className="text-sm text-muted-foreground">
                {t("pagination.page", { current: page, total: totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t("pagination.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t("pagination.next")}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
