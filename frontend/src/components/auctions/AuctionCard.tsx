"use client";

import { IAuction } from "@/types/auction";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { useAuctionStatus } from "@/hooks/useAuctionStatus";
import { useCurrency } from "@/hooks/useCurrency";

interface IAuctionCardProps {
  auction: IAuction;
  href?: string;
  showActions?: boolean;
}

export function AuctionCard({ auction, href, showActions }: IAuctionCardProps) {
  const { colorClass, isLive, label } = useAuctionStatus(auction.status);
  const { formatRaw, symbol } = useCurrency();

  return (
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

      <CardFooter className="p-4 pt-0">
        <Link
          href={href || `/auctions/${auction._id}`}
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "w-full bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all"
          )}
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
