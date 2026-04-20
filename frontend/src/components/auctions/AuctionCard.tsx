"use client";

import Link from "next/link";

// External
import { Clock, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

// Types
import { IAuctionCardProps } from "@/types/components";

// Hooks
import { useAuctionStatus } from "@/hooks/useAuctionStatus";
import { useCurrency } from "@/hooks/useCurrency";
import { useCancelAuction } from "@/hooks/useAuction";

// Utils
import { cn } from "@/lib/utils";

// Components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";



export function AuctionCard({ auction, href, showActions }: IAuctionCardProps) {
  const { colorClass, isLive, label } = useAuctionStatus(auction.status, auction.endTime);
  const { formatRaw, symbol } = useCurrency();
  const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canCancel = showActions && !["active", "ended", "cancelled"].includes(auction.status);

  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (auction.status !== "active" || !auction.endTime) return;

    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

  return (
    <>
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Auction"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)}>
              Back
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              isLoading={isCancelling}
              onClick={() => {
                cancelAuction(auction._id);
                setShowCancelModal(false);
              }}
            >
              Confirm Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-white font-semibold">Are you sure?</p>
            <p className="text-sm text-muted-foreground mt-1">
              This action will permanently cancel the auction for <span className="text-white">"{auction.title}"</span>.
            </p>
          </div>
        </div>
      </Modal>

      <Card className="group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 overflow-hidden hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 hover:ring-1 hover:ring-primary/30">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("capitalize font-bold text-[10px] tracking-widest", colorClass)}>
            {label}
          </Badge>
          {isLive && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse flex items-center gap-1 px-1.5 py-0">
               <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               <span className="text-[9px] font-black">LIVE</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {auction.bidCount !== undefined && (
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
              {auction.bidCount} Bids
            </span>
          )}
          {auction.currentUserStatus && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] uppercase font-bold tracking-tight px-1.5 py-0",
                auction.currentUserStatus === "winning" 
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" 
                  : "bg-amber-500/20 text-amber-500 border-amber-500/20"
              )}
            >
              {auction.currentUserStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
            {auction.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {auction.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {auction.highestBid > 0 ? "Current Bid" : "Base Price"}
            </span>
            <div className="flex items-center gap-1.5 text-xl font-black text-white italic">
              <span className="text-primary not-italic">₹</span>
              {formatRaw(auction.highestBid > 0 ? auction.highestBid : auction.basePrice)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right block">
              {auction.status === "active" ? "Ending In" : "Starts"}
            </span>
            <div className={cn(
              "flex items-center justify-end gap-1.5 text-sm font-black transition-colors duration-500",
              auction.status === "active" ? (timeLeft.startsWith("00:0") ? "text-rose-500 animate-pulse" : "text-indigo-400") : "text-white/80"
            )}>
              <Clock className="w-3.5 h-3.5 opacity-60" />
              {auction.status === "active" ? timeLeft : format(new Date(auction.startTime), "MMM d, h:mm a")}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-3">
        <Link
          href={href || `/auctions/${auction._id}`}
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "flex-1 bg-white/5 border-white/10 hover:bg-primary/20 hover:text-white transition-all"
          )}
        >
          View Details
        </Link>
        {canCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-white/5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
    </>
  );
}
