"use client";

import { useParams, useRouter } from "next/navigation";

// External 
import { Loader2, Clock, Trophy, AlertCircle, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// State (Auth store)
import { useAuthStore } from "@/store/auth.store";

// Hooks
import { useAuctionDetails, useCancelAuction } from "@/hooks/useAuction";

// Utils
import { formatCurrency } from "@/lib/utils";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AuctionDetailPage() {
   const { id } = useParams();
   const router = useRouter();
   const user = useAuthStore((state) => state.user);

   const { data: response, isLoading } = useAuctionDetails(id as string);
   const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();

   const auction = response?.data;
   const isOwner = auction?.sellerId?._id === user?._id;
   const canCancel = isOwner && !["active", "ended", "cancelled"].includes(auction?.status || "");

   const handleCancel = () => {
      if (confirm("Are you sure you want to cancel this auction? This action cannot be undone.")) {
         cancelAuction(id as string, {
            onSuccess: () => {
               toast.success("Auction cancelled successfully");
               router.back();
            },
            onError: (err: any) => {
               toast.error(err.response?.data?.message || "Failed to cancel auction");
            }
         });
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   if (!auction) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Auction not found</h2>
            <Button onClick={() => router.back()}>Go Back</Button>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
         <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-white">
               <ChevronLeft className="mr-2 h-4 w-4" />
               Back
            </Button>
            {canCancel && (
               <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
               >
                  {isCancelling ? "Cancelling..." : "Cancel Auction"}
               </Button>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
               <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
                  <CardHeader className="p-8 pb-4">
                     <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-bold tracking-wide">
                           {auction.status}
                        </Badge>
                        {auction.status === "active" && (
                           <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 animate-pulse">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              LIVE NOW
                           </span>
                        )}
                     </div>
                     <CardTitle className="text-4xl font-extrabold text-white tracking-tight">
                        {auction.title}
                     </CardTitle>
                     <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                        <span className="text-sm">Listed by</span>
                        <span className="text-sm font-bold text-white/80">{auction.sellerId.name}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Description</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                           {auction.description}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                           <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Timeline</h3>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-muted-foreground">Start Time</span>
                                 <span className="text-sm font-medium text-white">{format(new Date(auction.startTime), "PPP p")}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-muted-foreground">End Time</span>
                                 <span className="text-sm font-medium text-white">{format(new Date(auction.endTime), "PPP p")}</span>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Rules</h3>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-muted-foreground">Base Price</span>
                                 <span className="text-sm font-bold text-emerald-500">{formatCurrency(auction.basePrice)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-muted-foreground">Min. Increment</span>
                                 <span className="text-sm font-bold text-primary">{formatCurrency(auction.minIncrement)}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Right Column: Bidding Card */}
            <div className="space-y-6">
               <Card className="border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl">
                  <CardHeader className="text-center p-8">
                     <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em]">
                        Current Highest Bid
                     </CardTitle>
                     <div className="mt-4 text-5xl font-black text-white">
                        {formatCurrency(auction.highestBid || auction.basePrice)}
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                     <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 rounded-xl border border-white/10">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-200">
                           {auction.status === "active" ? "Ends in --:--:--" : auction.status === "approved" ? "Starts soon" : "Auction inactive"}
                        </span>
                     </div>

                     <div className="space-y-4">
                        <Button
                           className="w-full py-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                           disabled={auction.status !== "active" || isOwner}
                        >
                           {isOwner ? "Your Listing" : auction.status === "active" ? "Place Bid" : "Bidding Closed"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                           Bidding logic coming in Module 4
                        </p>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-white/5 bg-black/40 p-6">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-indigo-400" />
                     </div>
                     <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Bidder</p>
                        <p className="text-sm font-bold text-white">No bids placed yet</p>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}
