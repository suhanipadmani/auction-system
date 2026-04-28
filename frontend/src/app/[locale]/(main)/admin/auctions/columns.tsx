import Link from "next/link";

import { Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IAuction, AuctionStatus } from "@/types/auction";
import { useAuctionStatus } from "@/hooks/useAuctionStatus";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import { ITableColumn } from "@/types/components";


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
  isProcessing: boolean,
  t: any,
  formatCurrency: (amount: number) => string
): ITableColumn<IAuction>[] => [
    {
      header: t('table.item'),
      render: (auction) => (
        <div>
          <div className="font-bold">{auction.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{auction.description}</div>
        </div>
      ),
      className: "font-medium text-white px-6",
    },
    {
      header: t('table.seller'),
      render: (auction) => auction.sellerId.name,
      className: "text-gray-300",
    },
    {
      header: t('table.startingPrice'),
      render: (auction) => formatCurrency(auction.basePrice),
      className: "text-emerald-500 font-bold",
    },
    {
      header: t('table.startTime'),
      render: (auction) => formatDate(auction.startTime),

      className: "text-gray-300",
    },
    {
      header: t('table.actions'),
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

export const getInventoryColumns = (t: any, formatCurrency: (amount: number) => string): ITableColumn<IAuction>[] => [
  {
    header: t('table.item'),
    className: "font-medium text-white px-6",
    render: (auction) => (
      <div className="font-bold">{auction.title}</div>
    ),
  },
  {
    header: t('table.seller'),
    className: "text-gray-300",
    render: (auction) => auction.sellerId?.name || "Unknown",
  },
  {
    header: t('table.status'),
    render: (auction) => <StatusBadge status={auction.status} />,
  },
  {
    header: t('table.currentBid'),
    className: "text-emerald-500 font-bold",
    render: (auction) => formatCurrency(auction.highestBid || auction.basePrice),
  },
  {
    header: t('table.dateCreated'),
    className: "text-gray-300 text-xs",
    render: (auction) => formatDate(auction.createdAt, "date"),
  },
  {
    header: t('table.action'),
    headerClassName: "text-right px-6",
    className: "text-right px-6",
    render: (auction) => (
      <Link href={`/auctions/${auction._id}`}>
        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 gap-2">
          <Eye className="h-4 w-4" />
          {t('table.details')}
        </Button>
      </Link>
    ),
  },
];
