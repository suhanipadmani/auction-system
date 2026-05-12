"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownCircle, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

// Hooks
import { useMyPayoutRequests } from "@/hooks/useWallet";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

// Utils
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";

// Types
import { IPayoutRequest } from "@/types/wallet";
import { IPageColumn } from "@/types/components";


export default function WithdrawalsPage() {
  const t = useTranslations("wallet.user");
  const tw = useTranslations("wallet");
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState<number>(1);

  const { data: payoutRequestsData, isLoading } = useMyPayoutRequests(page, 20);
  const totalPages = (payoutRequestsData as any)?.totalPages || 1;


  const columns: IPageColumn<IPayoutRequest>[] = [
    {
      key: "amount",
      label: tw("table.amount"),
      render: (req) => (
        <span className="font-bold text-lg text-rose-400">{formatCurrency(req.amount)}</span>
      ),
    },
    {
      key: "date",
      label: tw("table.date"),
      render: (req) => (
        <span className="text-muted-foreground text-sm">{formatDate(req.createdAt)}</span>
      ),
    },
    {
      key: "adminNote",
      label: t("adminMessage"),
      render: (req) => (
        <span className="text-muted-foreground text-xs italic">{req.adminNote || "—"}</span>
      ),
    },
    {
      key: "status",
      label: tw("table.status"),
      align: "right",
      render: (req) => (
        <Badge
          variant={
            req.status === "approved" ? "default"
              : req.status === "pending" ? "outline"
                : "destructive"
          }
          className="capitalize h-6 px-3"
        >
          {tw(`statuses.${req.status}`)}
        </Badge>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
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
          title={t("withdrawalHistoryTitle")}
          subtitle={t("withdrawalHistorySubtitle")}
        />
      </div>

      {/* Withdrawals Card */}
      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-rose-400" />
            {t("withdrawalRequestsHeader")}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            {/* Header — driven by column definitions */}
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={col.align === "right" ? "text-right" : undefined}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : payoutRequestsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    {t("noWithdrawals")}
                  </TableCell>
                </TableRow>
              ) : (
                payoutRequestsData?.data?.map((req: IPayoutRequest) => (
                  <TableRow key={req._id} className="border-border/40 hover:bg-white/5 transition-colors">
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={col.align === "right" ? "text-right" : undefined}
                      >
                        {col.render(req)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-border/40">
              <span className="text-sm text-muted-foreground">
                {t("pagination.page", { current: page, total: totalPages })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t("pagination.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
