"use client";

import { useState } from "react";
import { 
  ArrowDownCircle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon
} from "lucide-react";

// Hooks
import { usePendingPayouts, useProcessPayout } from "@/hooks/useWallet";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function AdminPayoutsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  
  const { data: payoutsData, isLoading } = usePendingPayouts(statusFilter, page, 10);
  const processPayout = useProcessPayout();

  const totalPages = (payoutsData as any)?.totalPages || 1;

  const handleProcess = (requestId: string, status: "approved" | "rejected") => {
    const adminNote = window.prompt(
      status === "approved" 
        ? "Adding a note (optional):" 
        : "Reason for rejection (mandatory):"
    );

    if (status === "rejected" && !adminNote) {
      alert("Rejection note is required.");
      return;
    }

    processPayout.mutate({ requestId, status, adminNote: adminNote || "" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
      <DashboardHeader
        title="Payout Management"
        subtitle="Review and process withdrawal requests from bidders and sellers."
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {["pending", "approved", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status === "all" ? "" : status);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (status === "all" ? statusFilter === "" : statusFilter === status)
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                  </TableCell>
                </TableRow>
              ) : payoutsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground/30" />
                      <p>No payout requests found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payoutsData?.data?.map((payout: any) => (
                  <TableRow key={payout._id} className="border-border/40 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{payout.userId?.name}</span>
                          <span className="text-[10px] text-muted-foreground">{payout.userId?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-rose-400" />
                        <span className="font-bold text-lg">{formatCurrency(payout.amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(payout.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payout.status === "approved" ? "default" : 
                          payout.status === "pending" ? "outline" : 
                          "destructive"
                        }
                        className="capitalize text-[10px] font-bold tracking-wider"
                      >
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === "pending" ? (
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleProcess(payout._id, "rejected")}
                            disabled={processPayout.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => handleProcess(payout._id, "approved")}
                            disabled={processPayout.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground">
                          Processed: {formatDate(payout.updatedAt)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40 bg-white/5">
              <span className="text-xs text-muted-foreground font-medium">
                Showing page <span className="text-foreground">{page}</span> of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Disclaimer Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start">
        <Clock className="h-6 w-6 text-amber-500 mt-1 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-400 font-heading tracking-wide uppercase">Administrative Notice</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Approving a payout will permanently deduct the funds from the user's locked balance. 
            Ensure the physical or external money transfer is complete before marking as <span className="text-amber-500 font-bold italic">Approved</span>.
            Rejections will automatically release the locked funds back to the user's available balance.
          </p>
        </div>
      </div>
    </div>
  );
}
