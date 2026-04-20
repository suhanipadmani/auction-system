"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, History, PlusCircle, Lock, Loader2, ArrowUpCircle, ArrowDownCircle, RefreshCcw, ArrowRight } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useBalance, useTransactions, useMyRequests, useRequestDeposit, useMyPayoutRequests, useRequestPayout } from "@/hooks/useWallet";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";


export default function UserWalletPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user?.role === "admin") return null;

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance();
  
  // Summary views with specific limits
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions(1, 10);
  const { data: requestsData, isLoading: isRequestsLoading } = useMyRequests(1, 5);
  const { data: payoutRequestsData, isLoading: isPayoutRequestsLoading } = useMyPayoutRequests(1, 5);
  
  const requestDeposit = useRequestDeposit();
  const requestPayout = useRequestPayout();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    requestDeposit.mutate(Number(depositAmount), {
      onSuccess: () => setDepositAmount("")
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;
    requestPayout.mutate(Number(withdrawAmount), {
      onSuccess: () => setWithdrawAmount("")
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <DashboardHeader
        title="My Wallet"
        subtitle="Manage your balance and track your transaction history."
        statusLabel="Account Status"
        statusValue="Verified"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={isBalanceLoading ? "..." : formatCurrency(balanceData?.data?.balance || 0)}
          icon={<Wallet className="h-6 w-6 text-emerald-400" />}
          iconContainerClass="bg-emerald-400/10 border border-emerald-400/20"
        />
        <StatCard
          title="Locked Balance"
          value={isBalanceLoading ? "..." : formatCurrency(balanceData?.data?.lockedBalance || 0)}
          icon={<Lock className="h-6 w-6 text-amber-400" />}
          iconContainerClass="bg-amber-400/10 border border-amber-400/20"
        />

        {/* Add Money Quick Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">Quick Deposit</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
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
              Request
            </Button>
          </div>
        </div>

        {/* Withdrawal Quick Card */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-semibold uppercase tracking-wider text-rose-500/80">Withdrawal</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
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
              Payout
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Max: {formatCurrency(balanceData?.data?.balance || 0)}
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
                Latest Transactions
              </CardTitle>
              {transactionsData?.data?.length > 0 && (
                <Link 
                  href="/user/wallet/transactions" 
                  className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTransactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : transactionsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No transactions found.
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
                            <span className="capitalize font-medium">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(tx.amount)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={tx.status === "success" ? "default" : "destructive"} className="capitalize">
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
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
                Deposit History
              </CardTitle>
              {requestsData?.data?.length > 0 && (
                <Link 
                  href="/user/wallet/deposits" 
                  className="group flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-emerald-400 transition-colors uppercase tracking-wider font-semibold"
                >
                  All
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
                    No deposit requests yet.
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
                          {req.status}
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
                Withdrawal History
              </CardTitle>
              {payoutRequestsData?.data?.length > 0 && (
                <Link 
                  href="/user/wallet/withdrawals" 
                  className="group flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-rose-400 transition-colors uppercase tracking-wider font-semibold"
                >
                  All
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
                    No withdrawal requests yet.
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
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                      {req.adminNote && (
                        <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-border/20 mt-1">
                          Note: {req.adminNote}
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
