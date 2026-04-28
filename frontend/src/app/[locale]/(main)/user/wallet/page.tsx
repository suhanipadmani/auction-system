"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, History, PlusCircle, Lock, Loader2, ArrowUpCircle, ArrowDownCircle, RefreshCcw, ArrowRight } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useBalance, useTransactions, useMyRequests, useRequestDeposit, useMyPayoutRequests, useRequestPayout } from "@/hooks/useWallet";
import { useCurrency } from "@/hooks/useCurrency";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useTranslations } from "next-intl";

import { cn, formatDate } from "@/lib/utils";
import { getTransactionStyles } from "@/lib/utils/wallet/styles";




export default function UserWalletPage() {
  const t = useTranslations("wallet.user");
  const tw = useTranslations("wallet");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { formatCurrency, convertBack } = useCurrency();

  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions(1, 10);
  const { data: requestsData, isLoading: isRequestsLoading } = useMyRequests(1, 5);
  const { data: payoutRequestsData, isLoading: isPayoutRequestsLoading } = useMyPayoutRequests(1, 5);

  const requestDeposit = useRequestDeposit();
  const requestPayout = useRequestPayout();

  const txColumns = [
    { key: "type", label: tw("table.type"), skeletonWidth: "w-32" },
    { key: "amount", label: tw("table.amount"), skeletonWidth: "w-24" },
    { key: "date", label: tw("table.date"), skeletonWidth: "w-40" },
    { key: "status", label: tw("table.status"), className: "text-right", skeletonWidth: "w-20" },
  ];


  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user?.role === "admin") return null;



  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    const amountInBase = convertBack(Number(depositAmount));
    requestDeposit.mutate(amountInBase, {
      onSuccess: () => setDepositAmount("")
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;
    const amountInBase = convertBack(Number(withdrawAmount));
    requestPayout.mutate(amountInBase, {
      onSuccess: () => setWithdrawAmount("")
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        statusLabel={t("statusLabel")}
        statusValue={t("statusValue")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title={t("totalBalance")}
          value={isBalanceLoading ? "..." : formatCurrency(balanceData?.data?.balance || 0)}
          icon={<Wallet className="h-6 w-6 text-emerald-400" />}
          iconContainerClass="bg-emerald-400/10 border border-emerald-400/20"
        />
        <StatCard
          title={t("lockedBalance")}
          value={isBalanceLoading ? "..." : formatCurrency(balanceData?.data?.lockedBalance || 0)}
          icon={<Lock className="h-6 w-6 text-amber-400" />}
          iconContainerClass="bg-amber-400/10 border border-amber-400/20"
        />

        {/* Add Money Quick Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">{t("quickDeposit")}</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={t("amountPlaceholder")}
              className="h-10 text-sm ring-white/5"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handleDeposit}
              isLoading={requestDeposit.isPending}
              disabled={!depositAmount || Number(depositAmount) <= 0}
            >
              {t("request")}
            </Button>
          </div>
        </div>

        {/* Withdrawal Quick Card */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-semibold uppercase tracking-wider text-rose-500/80">{t("withdrawal")}</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={t("amountPlaceholder")}
              className="h-10 text-sm ring-white/5 border-rose-500/20 focus:border-rose-500/50"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={handleWithdraw}
              isLoading={requestPayout.isPending}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (balanceData?.data?.balance || 0)}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {t("payout")}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            {t("max")}: {formatCurrency(balanceData?.data?.balance || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-400" />
                {t("latestTransactions")}
              </CardTitle>
              {transactionsData?.data?.length > 0 && (
                <Link
                  href="/user/wallet/transactions"
                  className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  {t("viewAll")}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    {txColumns.map((col) => (
                      <TableHead key={col.key} className={col.className}>
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isTransactionsLoading ? (
                    <TableSkeleton cols={txColumns.map(c => c.skeletonWidth)} rows={5} />
                  ) : transactionsData?.data?.length === 0 ? (

                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {t("noTransactions")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactionsData?.data?.map((tx: any) => {
                      const { typeStyle, statusStyle } = getTransactionStyles(tx.type, tx.status);
                      const Icon = typeStyle.icon === "ArrowUpCircle" ? ArrowUpCircle : 
                                  typeStyle.icon === "ArrowDownCircle" ? ArrowDownCircle :
                                  typeStyle.icon === "Lock" ? Lock : RefreshCcw;

                      return (
                        <TableRow key={tx._id} className="border-border/40 hover:bg-white/5 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-4 w-4", typeStyle.text)} />
                              <span className="capitalize font-medium">{tw(`txTypes.${tx.type}`)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(tx.amount)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(tx.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={tx.status === "success" ? "default" : "destructive"} className={cn("capitalize", statusStyle)}>
                              {tw(`statuses.${tx.status}`)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })

                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Payout & Deposit Logs */}
        <div className="space-y-4">
          {/* Deposit Requests */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                {t("depositHistory")}
              </CardTitle>
              {requestsData?.data?.length > 0 && (
                <Link
                  href="/user/wallet/deposits"
                  className="group flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-emerald-400 transition-colors uppercase tracking-wider font-semibold"
                >
                  {t("all")}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isRequestsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : requestsData?.data?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm italic">
                    {t("noDeposits")}
                  </p>
                ) : (
                  requestsData?.data?.map((req: any) => (
                    <div key={req._id} className="p-3 rounded-lg border border-border/40 bg-background/40 flex flex-col gap-1 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground font-heading">{formatCurrency(req.amount)}</span>
                        <Badge
                          variant={req.status === "approved" ? "default" : req.status === "pending" ? "outline" : "destructive"}
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {tw(`statuses.${req.status}`)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payout Requests */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                {t("withdrawalHistory")}
              </CardTitle>
              {payoutRequestsData?.data?.length > 0 && (
                <Link
                  href="/user/wallet/withdrawals"
                  className="group flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-rose-400 transition-colors uppercase tracking-wider font-semibold"
                >
                  {t("all")}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isPayoutRequestsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : payoutRequestsData?.data?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm italic">
                    {t("noWithdrawals")}
                  </p>
                ) : (
                  payoutRequestsData?.data?.map((req: any) => (
                    <div key={req._id} className="p-3 rounded-lg border border-border/40 bg-background/40 flex flex-col gap-1 relative overflow-hidden group hover:border-rose-500/20 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground font-heading">{formatCurrency(req.amount)}</span>
                        <Badge
                          variant={req.status === "approved" ? "default" : req.status === "pending" ? "outline" : "destructive"}
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {tw(`statuses.${req.status}`)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                      {req.adminNote && (
                        <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-border/20 mt-1">
                          {t("note")}: {req.adminNote}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
