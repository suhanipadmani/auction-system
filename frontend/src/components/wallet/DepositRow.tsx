"use client";

import { XCircle, CheckCircle2 } from "lucide-react";

// Types
import { IDepositRequest } from "@/types/wallet";

// Utils
import { formatCurrency, formatDate } from "@/lib/utils";

// Components
import { TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DepositRowProps {
  req: IDepositRequest;
  onProcessClick: (req: IDepositRequest, type: "approved" | "rejected") => void;
  isLoading: boolean;
  processingId?: string;
}

export function DepositRow({ req, onProcessClick, isLoading, processingId }: DepositRowProps) {
  const isSelectedForProcessing = processingId === req._id && isLoading;

  return (
    <TableRow className="border-border/40 hover:bg-white/5 transition-colors group">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {req.userId?.name?.[0] || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{req.userId?.name}</span>
            <span className="text-[10px] text-muted-foreground">{req.userId?.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span className="font-bold text-emerald-400">{formatCurrency(req.amount)}</span>
      </TableCell>
      <TableCell className="py-4 text-xs text-muted-foreground">
        {formatDate(req.createdAt)}
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={`capitalize text-[10px] h-5 ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
        >
          {req.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right py-4">
        <div className="flex justify-end gap-2">
          {req.status === 'pending' ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-full"
                onClick={() => onProcessClick(req, "rejected")}
                title="Reject Request"
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 rounded-full"
                onClick={() => onProcessClick(req, "approved")}
                title="Approve Request"
                disabled={isLoading}
                isLoading={isSelectedForProcessing}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[10px] text-muted-foreground"
              disabled
            >
              Processed
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
