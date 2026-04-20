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

export default function DepositsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data: requestsData, isLoading } = useMyRequests(page, 20);

  const totalPages = (requestsData as any)?.totalPages || 1;

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
          title="Deposit History"
          subtitle="Track and manage all your deposit approval requests."
        />
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-sm shadow-xl mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
            Deposit Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Admin Message</TableHead>
                <TableHead className="text-right">Status</TableHead>
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
                    No deposit requests found.
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
                        {req.status}
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
                Page <span className="text-foreground font-bold">{page}</span> of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
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
