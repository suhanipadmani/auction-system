"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";

// Hooks
import { useMyRequests } from "@/hooks/useWallet";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";


export default function DepositsPage() {
  const t = useTranslations("wallet.user");
  const tw = useTranslations("wallet");
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState<number>(1);

  const { data: requestsData, isLoading } = useMyRequests(page, 20);

  const totalPages = (requestsData as any)?.totalPages || 1;
  
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
          title={t("depositHistoryTitle")}
          subtitle={t("depositHistorySubtitle")}
        />
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
            {t("depositRequestsHeader")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>{tw("table.amount")}</TableHead>
                <TableHead>{tw("table.date")}</TableHead>
                <TableHead>{t("adminMessage")}</TableHead>
                <TableHead className="text-right">{tw("table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : requestsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    {t("noDeposits")}
                  </TableCell>
                </TableRow>
              ) : (
                requestsData?.data?.map((req: any) => (
                  <TableRow key={req._id} className="border-border/40 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-lg">{formatCurrency(req.amount)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(req.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs italic">
                      {req.adminNote || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={req.status === "approved" ? "default" : req.status === "pending" ? "outline" : "destructive"}
                        className="capitalize h-6 px-3"
                      >
                        {tw(`statuses.${req.status}`)}
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
