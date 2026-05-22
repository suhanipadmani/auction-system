import { useAppMutation } from "./useAppMutation";
import { axiosClient as axios } from "@/lib/axios";
import { MESSAGES } from "../constants/messages";

export const useBidding = () => {
  // Place manual bid via API 
  const placeBidMutation = useAppMutation({
    mutationFn: async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      const response = await axios.post("/bids/place", { auctionId, amount });
      return response.data;
    },
    invalidateKeys: [["auction"], ["bids"]],
    successMessage: MESSAGES.SUCCESS.BID_PLACED,
  });

  // Setup auto-bid
  const setupAutoBidMutation = useAppMutation({
    mutationFn: async ({ auctionId, limit }: { auctionId: string; limit: number }) => {
      const response = await axios.post("/bids/auto-setup", { auctionId, limit });
      return response.data;
    },
    invalidateKeys: [["auction"], ["bid-status"]],
    successMessage: MESSAGES.SUCCESS.BID_PLACED,
  });

  return {
    placeBid: placeBidMutation.mutate,
    isPlacingBid: placeBidMutation.isPending,
    setupAutoBid: setupAutoBidMutation.mutate,
    isSettingAutoBid: setupAutoBidMutation.isPending
  };
};

