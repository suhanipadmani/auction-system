"use client";

import Link from "next/link";

// External
import { Clock, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

// Types
import { IAuction } from "@/types/auction";

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
import { useState } from "react";


interface IAuctionCardProps {
  auction: IAuction;
  href?: string;
  showActions?: boolean;
}

export function AuctionCard({ auction, href, showActions }: IAuctionCardProps) {
  const { colorClass, isLive, label } = useAuctionStatus(auction.status);
  const { formatRaw, symbol } = useCurrency();
  const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canCancel = showActions && !["active", "ended", "cancelled"].includes(auction.status);

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

      <Card className="group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-white/5">
        <Badge variant="outline" className={cn("capitalize font-medium", colorClass)}>
          {label}
        </Badge>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE
          </span>
        )}
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
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {auction.highestBid > 0 ? "Current Bid" : "Base Price"}
            </span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-white">
              <span className="text-primary">{symbol}</span>
              {formatRaw(auction.highestBid > 0 ? auction.highestBid : auction.basePrice)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Starts
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              {format(new Date(auction.startTime), "MMM d, HH:mm")}
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
