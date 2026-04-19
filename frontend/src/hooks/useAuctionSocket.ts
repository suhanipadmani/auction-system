import { useEffect, useCallback, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { AUCTION_KEYS } from "./useAuction";
import toast from "react-hot-toast";

export const useAuctionSocket = (auctionId: string) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  // Local state for real-time overrides (Hybrid Approach)
  const [realTimeData, setRealTimeData] = useState<{
    highestBid?: number;
    highestBidderId?: string;
    highestBidderName?: string;
  }>({});

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isConnected && auctionId) {
      socket.emit("join_auction", auctionId);
      
      // Sync state after potential disconnection gap
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(auctionId) });
      queryClient.invalidateQueries({ queryKey: ["bids", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["bid-status", auctionId] });
    }
  }, [isConnected, auctionId, socket, queryClient]);

  useEffect(() => {
    if (!auctionId) return;

    const handleNewBid = (data: any) => {
      if (data.type === "BID_UPDATED" && data.payload.auctionId === auctionId) {
        const { amount, bidderId, bidderName } = data.payload;

        // Reset pending state
        setIsPending(false);

        // 1. Update the React Query cache directly (Source of Truth sync)
        queryClient.setQueryData(AUCTION_KEYS.detail(auctionId), (oldResponse: any) => {
          if (!oldResponse?.data) return oldResponse;
          return {
            ...oldResponse,
            data: {
              ...oldResponse.data,
              highestBid: amount,
              highestBidderId: bidderId,
            }
          };
        });

        // 2. Update local state for immediate re-render
        setRealTimeData({
          highestBid: amount,
          highestBidderId: bidderId,
          highestBidderName: bidderName
        });

        // 3. Invalidate related queries (History, etc.)
        queryClient.invalidateQueries({ queryKey: ["bids", auctionId] });
      }
    };

    const handleStatusUpdate = (data: any) => {
      if (data.payload.auctionId === auctionId) {
        queryClient.setQueryData(AUCTION_KEYS.detail(auctionId), (oldResponse: any) => {
          if (!oldResponse?.data) return oldResponse;
          return {
            ...oldResponse,
            data: {
              ...oldResponse.data,
              status: data.payload.status,
            }
          };
        });
        
        toast.success(`Auction status updated: ${data.payload.status}`, { icon: '📢' });
      }
    };

    const handleError = (data: any) => {
      if (data.type === "BID_ERROR") {
        setIsPending(false);
        toast.error(data.message);
      }
    };

    socket.on("new_bid", handleNewBid);
    socket.on("auction_status_update", handleStatusUpdate);
    socket.on("error", handleError);

    // CLEANUP: Explicitly remove listeners on unmount
    return () => {
      socket.off("new_bid", handleNewBid);
      socket.off("auction_status_update", handleStatusUpdate);
      socket.off("error", handleError);
    };
  }, [auctionId, socket, queryClient]);

  const placeBid = useCallback((amount: number) => {
    setIsPending(true);
    socket.emit("place_bid", { auctionId, amount });
  }, [auctionId, socket]);

  return { 
    ...realTimeData,
    placeBid, 
    isPending,
    isConnected
  };
};
