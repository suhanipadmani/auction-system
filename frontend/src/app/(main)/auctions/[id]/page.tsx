"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trophy, AlertCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

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
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: response, isLoading } = useAuctionDetails(id as string);
  const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();
  const { mutate: approveReject, isPending: isProcessingAdmin } = useAdminApprove();
  const { mutate: finalizeAuction, isPending: isFinalizing } = useFinalizeAuction();

  // Admin review states
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: "approve" | "reject" | null }>({
    isOpen: false,
    action: null
  });

  // Real-time updates
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
    if (confirm("Are you sure you want to cancel this auction? This action cannot be undone.")) {
      cancelAuction(id as string, {
        onSuccess: () => {
          toast.success("Auction cancelled successfully");
          router.back();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to cancel auction");
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
        toast.success(`Auction ${confirmModal.action}ed successfully`);
        setConfirmModal({ isOpen: false, action: null });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Action failed");
      }
    });
  };

  const handleFinalize = () => {
    if (confirm("Are you sure you want to finalize this sale? This will transfer funds from the winner to your wallet.")) {
      finalizeAuction(id as string, {
        onSuccess: () => toast.success("Sale finalized successfully!"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to finalize sale")
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-white -ml-2">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
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
              {isCancelling ? "..." : "Cancel"}
            </Button>
          )}
          {isOwner && auction.status === 'ended' && auction.highestBidderId && (
            <Button
              size="sm"
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg flex-1 sm:flex-none"
            >
              {isFinalizing ? "..." : "Finalize Sale"}
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
                  {auction.status}
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
                <span className="text-sm">Listed by</span>
                <span className="text-sm font-bold text-white/80">{auction.sellerId.name}</span>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-8 pt-4 space-y-8">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white border-b border-white/5 pb-2">Description</h3>
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
            highestBidderName={highestBidderName} 
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
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="text-xl font-bold">Auction not found</h2>
      <Button onClick={onBack}>Go Back</Button>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-500 animate-pulse ml-auto">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      LIVE NOW
    </span>
  );
}

function TopBidderCard({ highestBidderName, auctionHighestBidder }: any) {
  const name = highestBidderName || (auctionHighestBidder && typeof auctionHighestBidder === 'object' ? (auctionHighestBidder as any).name : "No bids placed yet");
  return (
    <Card className="border-white/5 bg-black/40 p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Bidder</p>
          <p className="text-sm font-bold text-white">{name}</p>
        </div>
      </div>
    </Card>
  );
}

function AdminActionModal({ confirmModal, isProcessing, onClose, onConfirm }: any) {
  return (
    <Modal
      isOpen={confirmModal.isOpen}
      onClose={onClose}
      title={confirmModal.action === "approve" ? "Approve Auction" : "Reject Auction"}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button 
            variant={confirmModal.action === "approve" ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : confirmModal.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </div>
      }
    >
      <p className="text-gray-300">
        Are you sure you want to <span className="font-bold text-white tracking-wide uppercase">{confirmModal.action}</span> this auction? 
        {confirmModal.action === "approve" ? " This will make the auction visible and allow bidding at the scheduled start time." : " This will permanently reject the request."}
      </p>
    </Modal>
  );
}
