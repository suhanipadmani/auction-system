"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// External
import { Wallet, History, PlusCircle, Lock, Loader2, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";

// State (Auth Store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useState } from "react";
import { useBalance, useTransactions, useMyRequests, useRequestDeposit } from "@/hooks/useWallet";

// Components
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
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions();
  const { data: requestsData, isLoading: isRequestsLoading } = useMyRequests();
  const requestDeposit = useRequestDeposit();

  const [depositAmount, setDepositAmount] = useState("");

  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    requestDeposit.mutate(Number(depositAmount), {
      onSuccess: () => setDepositAmount("")
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">My Wallet</h1>
        <p className="text-muted-foreground font-medium">Manage your balance and track your transaction history.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              placeholder="Amount (₹)"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-400" />
                Transaction History
              </CardTitle>
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

        {/* Deposit Requests */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
                Deposit Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRequestsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : requestsData?.data?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm italic">
                    No deposit requests yet.
                  </p>
                ) : (
                  requestsData?.data?.map((req: any) => (
                    <div key={req._id} className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground font-heading">{formatCurrency(req.amount)}</span>
                        <Badge
                          variant={req.status === "approved" ? "default" : req.status === "pending" ? "outline" : "destructive"}
                          className="capitalize"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                      {req.adminNote && (
                        <p className="text-xs italic text-muted-foreground pt-1 border-t border-border/40 mt-1">
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
