import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

// External
import { formatDistanceToNow } from "date-fns";
import { Loader2, User, Zap, History, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
// Types
import { IBidHistoryProps, IBidItemProps, IFullHistoryModalProps } from "@/types/components";
// Hooks
import { useAuctionBids, useInfiniteAuctionBids } from "@/hooks/useAuction";
import { useCurrency } from "@/hooks/useCurrency";
// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  const t = useTranslations("auction.details");
  const { ref, inView } = useInView();
  
  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage 
  } = useInfiniteAuctionBids(auctionId, 10);

  const bids = data?.pages.flatMap(page => page.data) || [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('completeBidHistory')}
    >
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {bids.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <History className="h-12 w-12 mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">{t('noBidsYet')}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {bids.map((bid, index) => (
                <BidItem 
                  key={bid._id} 
                  bid={bid} 
                  index={index} 
                  page={1} // In infinite scroll, we treat it as continuous
                />
              ))}
              
              {/* Infinite Scroll Trigger */}
              <div ref={ref} className="h-10 flex items-center justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
                )}
              </div>
            </div>
          )}
          
          {isLoading && bids.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl z-50">
              <div className="bg-black/60 p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 animate-pulse">Loading History</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
