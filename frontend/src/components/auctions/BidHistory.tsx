"use client";

import { useAuctionBids } from "@/hooks/useAuction";
import { formatCurrency, cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, User, Zap, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface BidHistoryProps {
  auctionId: string;
}

export const BidHistory = ({ auctionId }: BidHistoryProps) => {
  const { data: response, isLoading } = useAuctionBids(auctionId);
  const bids = response?.data || [];

  if (isLoading) {
    return (
      <Card className="border-white/5 bg-black/40 backdrop-blur-xl">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden border-t-0 rounded-t-none">
      <CardHeader className="p-6 pb-2 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/70">
          <History className="h-4 w-4 text-primary" />
          Bid History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
        {bids.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-white/20" />
            </div>
            <p className="text-sm font-bold text-white/50">No bids yet</p>
            <p className="text-xs text-white/30">Be the first to place a bid on this item!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {bids.map((bid, index) => (
              <div 
                key={bid._id} 
                className={cn(
                  "p-4 flex items-center justify-between transition-colors hover:bg-white/5",
                  index === 0 && "bg-primary/5" // Highlight latest bid
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center ring-1 ring-inset",
                    index === 0 ? "bg-primary/20 ring-primary/30" : "bg-white/5 ring-white/10"
                  )}>
                    <User className={cn(
                      "h-5 w-5",
                      index === 0 ? "text-primary" : "text-white/40"
                    )} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold",
                        index === 0 ? "text-white" : "text-white/80"
                      )}>
                        {bid.bidderName}
                      </span>
                      {bid.isMine && (
                         <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black h-4 px-1.5 px-1.5">YOU</Badge>
                      )}
                      {bid.isAutoBid && (
                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-white/40 font-medium">
                      {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <p className={cn(
                    "font-black tracking-tight",
                    index === 0 ? "text-lg text-primary" : "text-sm text-white/90"
                  )}>
                    {formatCurrency(bid.amount)}
                  </p>
                  {index === 0 && (
                    <Badge variant="outline" className="text-[9px] border-primary/20 text-primary font-bold">CURRENT HIGH</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
