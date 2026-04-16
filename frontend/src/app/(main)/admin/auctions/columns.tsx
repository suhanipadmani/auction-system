import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IAuction, AuctionStatus } from "@/types/auction";
import { useAuctionStatus } from "@/hooks/useAuctionStatus";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

function StatusBadge({ status }: { status: AuctionStatus }) {
    const { label, colorClass } = useAuctionStatus(status);
    return (
        <Badge variant="outline" className={cn("capitalize px-1.5 py-0 text-[10px]", colorClass)}>
            {label}
        </Badge>
    );
}

export const getApprovalColumns = (
  onAction: (id: string, action: "approve" | "reject") => void,
  isProcessing: boolean
): TableColumn<IAuction>[] => [
  {
    header: "Auction Item",
    render: (auction) => (
      <div>
        <div className="font-bold">{auction.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">{auction.description}</div>
      </div>
    ),
    className: "font-medium text-white px-6",
  },
  {
    header: "Seller",
    render: (auction) => auction.sellerId.name,
    className: "text-gray-300",
  },
  {
    header: "Base Price",
    render: (auction) => `₹${auction.basePrice.toLocaleString()}`,
    className: "text-emerald-500 font-bold",
  },
  {
    header: "Scheduled Start",
    render: (auction) => format(new Date(auction.startTime), "MMM d, HH:mm"),
    className: "text-gray-300",
  },
  {
    header: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    render: (auction) => (
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
          onClick={() => onAction(auction._id, "approve")}
          className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={isProcessing}
          onClick={() => onAction(auction._id, "reject")}
          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const getInventoryColumns = (): TableColumn<IAuction>[] => [
  {
    header: "Auction Item",
    className: "font-medium text-white px-6",
    render: (auction) => (
      <div className="font-bold">{auction.title}</div>
    ),
  },
  {
    header: "Seller",
    className: "text-gray-300",
    render: (auction) => auction.sellerId?.name || "Unknown",
  },
  {
    header: "Status",
    render: (auction) => <StatusBadge status={auction.status} />,
  },
  {
    header: "Current Bid",
    className: "text-emerald-500 font-bold",
    render: (auction) => `₹${(auction.highestBid || auction.basePrice).toLocaleString()}`,
  },
  {
    header: "Date Created",
    className: "text-gray-300 text-xs",
    render: (auction) => format(new Date(auction.createdAt), "MMM d, yyyy"),
  },
  {
    header: "Action",
    headerClassName: "text-right px-6",
    className: "text-right px-6",
    render: (auction) => (
      <Link href={`/auctions/${auction._id}`}>
        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 gap-2">
          <Eye className="h-4 w-4" />
          Details
        </Button>
      </Link>
    ),
  },
];
