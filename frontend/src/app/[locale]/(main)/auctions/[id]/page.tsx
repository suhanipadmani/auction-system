"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trophy, AlertCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// State & Hooks
import { useAuthStore } from "@/store/auth.store";
import {
  useAuctionDetails,
  useCancelAuction,
  useAdminApprove,
  useFinalizeAuction
} from "@/hooks/useAuction";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BiddingSection } from "@/components/auctions/BiddingSection";
import { BidHistory } from "@/components/auctions/BidHistory";
import { Modal } from "@/components/ui/Modal";

// Sub-components (Decomposed)
import { AuctionTimeline } from "@/components/auctions/AuctionTimeline";
import { AuctionRules } from "@/components/auctions/AuctionRules";
import { AdminControls } from "@/components/auctions/AdminControls";

export default function AuctionDetailPage() {
  const t = useTranslations("auction.details");
  const tw = useTranslations("wallet");
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: "approve" | "reject" | null }>({
    isOpen: false,
    action: null
  });

  const { data: response, isLoading } = useAuctionDetails(id as string);
  const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();
  const { mutate: approveReject, isPending: isProcessingAdmin } = useAdminApprove();
  const { mutate: finalizeAuction, isPending: isFinalizing } = useFinalizeAuction();
  const {
    highestBid,
    highestBidderId,
    highestBidderName,
    isPending: isSocketPending,
    placeBid
  } = useAuctionSocket(id as string);

  const auction = response?.data;

  if (isLoading) return <LoadingState />;
  if (!auction) return <ErrorState onBack={() => router.back()} />;

  const isOwner = auction?.sellerId?._id === user?._id;
  const canCancel = isOwner && !["active", "ended", "cancelled"].includes(auction?.status || "");

  const handleCancel = () => {
    if (confirm(t('cancelConfirm'))) {
      cancelAuction(id as string, {
        onSuccess: () => {
          toast.success(t('cancelSuccess'));
          router.back();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || t('errors.cancelFailed'));
        }
      });
    }
  };

  const handleAdminAction = (action: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, action });
  };

  const handleConfirmAdmin = () => {
    if (!confirmModal.action) return;
    approveReject({ id: id as string, action: confirmModal.action }, {
      onSuccess: () => {
        toast.success(t('admin.success', { action: tw(`table.actions.${confirmModal.action}`).toLowerCase() }));
        setConfirmModal({ isOpen: false, action: null });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || t('errors.actionFailed'));
      }
    });
  };

  const handleFinalize = () => {
    if (confirm(t('finalizeConfirm'))) {
      finalizeAuction(id as string, {
        onSuccess: () => toast.success(t('finalizeSuccess')),
        onError: (err: any) => toast.error(err.response?.data?.message || t('errors.finalizeFailed'))
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-white -ml-2">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 flex-1 sm:flex-none"
            >
              {isCancelling ? t('cancelling') : t('cancel')}
            </Button>
          )}
          {isOwner && auction.status === 'ended' && auction.highestBidderId && (
            <Button
              size="sm"
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg flex-1 sm:flex-none"
            >
              {isFinalizing ? t('finalizing') : t('finalizeSale')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-5 sm:p-8 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-bold">
                  {tw(`statuses.${auction.status}`)}
                </Badge>
                {auction.status === "pending" && user?.role === "admin" && (
                  <AdminControls onAction={handleAdminAction} isProcessing={isProcessingAdmin} />
                )}
                {auction.status === "active" && <LiveBadge />}
              </div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {auction.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <span className="text-sm">{t('listedBy')}</span>
                <span className="text-sm font-bold text-white/80">{auction.sellerId.name}</span>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-8 pt-4 space-y-8">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/5 pb-2">{t('description')}</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {auction.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <AuctionTimeline startTime={auction.startTime} endTime={auction.endTime} />
                <AuctionRules basePrice={auction.basePrice} minIncrement={auction.minIncrement} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bidding Card */}
        <div className="space-y-6">
          <BiddingSection
            auction={auction}
            socketData={{
              highestBid: highestBid ?? null,
              highestBidderId: highestBidderId ?? null,
              isPending: isSocketPending,
              placeBid
            }}
          />
          <BidHistory auctionId={id as string} />
          <TopBidderCard
            highestBidderName={highestBidderName ?? null}
            auctionHighestBidder={auction.highestBidderId}
          />

        </div>
      </div>

      <AdminActionModal
        confirmModal={confirmModal}
        isProcessing={isProcessingAdmin}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAdmin}
      />
    </div>
  );
}

// Internal Helper Components
function LoadingState() {
  const tc = useTranslations("common");
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">{tc('loading')}</span>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  const t = useTranslations("auction.details.errors");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="text-xl font-bold">{t('notFound')}</h2>
      <Button onClick={onBack}>{t('goBack')}</Button>
    </div>
  );
}

function LiveBadge() {
  const t = useTranslations("auction.details");
  return (
    <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-500 animate-pulse ml-auto">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {t('live')}
    </span>
  );
}

function TopBidderCard({ highestBidderName, auctionHighestBidder }: { highestBidderName: string | null; auctionHighestBidder: any }) {

  const t = useTranslations("auction.details");
  const name = highestBidderName || (auctionHighestBidder && typeof auctionHighestBidder === 'object' ? (auctionHighestBidder as any).name : t('noBidsPlaced'));
  return (
    <Card className="border-white/5 bg-black/40 p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t('topBidder')}</p>
          <p className="text-sm font-bold text-white">{name}</p>
        </div>
      </div>
    </Card>
  );
}

function AdminActionModal({ confirmModal, isProcessing, onClose, onConfirm }: { 
  confirmModal: { isOpen: boolean; action: "approve" | "reject" | null };
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {

  const t = useTranslations("auction.details.admin");
  const tw = useTranslations("wallet.table.actions");
  const tc = useTranslations("common");
  
  return (
    <Modal
      isOpen={confirmModal.isOpen}
      onClose={onClose}
      title={confirmModal.action === "approve" ? t('approveTitle') : t('rejectTitle')}
      cancelText={tc('cancel')}
      confirmText={isProcessing ? t('processing') : confirmModal.action === "approve" ? t('confirmApproval') : t('confirmRejection')}
      onCancel={onClose}
      onConfirm={onConfirm}
      isConfirmLoading={isProcessing}
      isDanger={confirmModal.action === "reject"}
    >
      <p className="text-gray-300">
        {t('notice', { 
          action: tw(confirmModal.action === 'approve' ? 'approve' : 'reject').toUpperCase() 
        })}
        {confirmModal.action === "approve" ? t('approveEffect') : t('rejectEffect')}
      </p>
    </Modal>
  );
}
