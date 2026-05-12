import { useState } from "react";
import { cn } from "@/lib/utils";

// External
import { formatDistanceToNow } from "date-fns";
import { Loader2, User, Zap, History, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
// Types
import { IBidHistoryProps, IBidItemProps, IFullHistoryModalProps } from "@/types/components";
// Hooks
import { useAuctionBids } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";


export const BidHistory = ({ auctionId }: IBidHistoryProps) => {
  useCurrency();
  const t = useTranslations("auction.details");
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState<boolean>(false);
  const { data: response, isLoading } = useAuctionBids(auctionId, { page: 1, limit: 3 });
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
    <>
      <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden border-t-0 rounded-t-none">
        <CardHeader className="p-6 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/70">
            <History className="h-4 w-4 text-primary" />
            {t('bidHistory')}
          </CardTitle>
          {bids.length > 0 && (
            <button
              onClick={() => setIsFullHistoryOpen(true)}
              className="group flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-white transition-colors uppercase tracking-widest"
            >
              {t('viewAll')}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </CardHeader>
        <CardContent className="p-0 custom-scrollbar">
          {bids.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-white/20" />
              </div>
              <p className="text-sm font-bold text-white/50">{t('noBidsYet')}</p>
              <p className="text-xs text-white/30">{t('beTheFirst')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {bids.map((bid, index) => (
                <BidItem key={bid._id} bid={bid} index={index} page={1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FullHistoryModal
        isOpen={isFullHistoryOpen}
        onClose={() => setIsFullHistoryOpen(false)}
        auctionId={auctionId}
      />
    </>
  );
};

// Sub-component for individual bid rows
const BidItem = ({ bid, index, page }: IBidItemProps) => {
  const { formatCurrency } = useCurrency();
  const t = useTranslations("auction.details");
  return (
  <div
    className={cn(
      "p-4 flex items-center justify-between transition-colors hover:bg-white/5",
      index === 0 && page === 1 && "bg-primary/5"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center ring-1 ring-inset",
        index === 0 && page === 1 ? "bg-primary/20 ring-primary/30" : "bg-white/5 ring-white/10"
      )}>
        <User className={cn(
          "h-5 w-5",
          index === 0 && page === 1 ? "text-primary" : "text-white/40"
        )} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold",
            index === 0 && page === 1 ? "text-white" : "text-white/80"
          )}>
            {bid.bidderName}
          </span>
          {bid.isMine && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black h-4 px-1.5">{t('you')}</Badge>
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
        index === 0 && page === 1 ? "text-lg text-primary" : "text-sm text-white/90"
      )}>
        {formatCurrency(bid.amount)}
      </p>
      {index === 0 && page === 1 && (
        <Badge variant="outline" className="text-[9px] border-primary/20 text-primary font-bold">{t('currentHigh')}</Badge>
      )}
    </div>
  </div>
  );
};

// Full history modal component
const FullHistoryModal = ({ isOpen, onClose, auctionId }: IFullHistoryModalProps) => {
  useCurrency();
  const t = useTranslations("auction.details");
  const tm = useTranslations("auction.management");
  const [page, setPage] = useState<number>(1);
  const { data: response, isLoading } = useAuctionBids(auctionId, { page, limit: 10 });
  const bids = response?.data || [];
  const totalPages = response?.totalPages || 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('completeBidHistory')}
    >
      <div className="min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-white/5">
              {bids.map((bid, index) => (
                <BidItem key={bid._id} bid={bid} index={index} page={page} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> {tm('pagination.previous')}
                </Button>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tm('page', { current: page, total: totalPages })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 text-xs"
                >
                  {tm('pagination.next')} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
