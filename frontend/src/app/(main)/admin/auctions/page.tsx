"use client";

import Link from "next/link";

// External
import { Loader2, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Hooks
import { useAuctions, useAdminApprove } from "@/hooks/useAuction";

// Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

export default function AdminAuctionApprovalPage() {
  const { data: response, isLoading } = useAuctions({ status: "pending" });
  const { mutate: approveReject, isPending: isProcessing } = useAdminApprove();

  const handleAction = (id: string, action: "approve" | "reject") => {
    approveReject({ id, action }, {
      onSuccess: () => {
        toast.success(`Auction ${action}ed successfully`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Action failed");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader
        userName="Auction Approvals"
        subtitle="Review and approve pending auction listings."
      />

      <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : response?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">No pending auctions to review.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-gray-400">Auction Item</TableHead>
                <TableHead className="text-gray-400">Seller</TableHead>
                <TableHead className="text-gray-400">Base Price</TableHead>
                <TableHead className="text-gray-400">Scheduled Start</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response?.data.map((auction) => (
                <TableRow key={auction._id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-white px-6">
                    <div>
                      <div className="font-bold">{auction.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{auction.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{auction.sellerId.name}</TableCell>
                  <TableCell className="text-emerald-500 font-bold">₹{auction.basePrice.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-300">{format(new Date(auction.startTime), "MMM d, HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/auctions/${auction._id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isProcessing}
                        onClick={() => handleAction(auction._id, "approve")}
                        className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isProcessing}
                        onClick={() => handleAction(auction._id, "reject")}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
