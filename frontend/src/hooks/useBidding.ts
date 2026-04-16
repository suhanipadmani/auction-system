import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient as axios } from "@/lib/axios";

export const useBidding = () => {
  const queryClient = useQueryClient();

  // Place manual bid via API (backup/alternative to sockets)
  const placeBidMutation = useMutation({
    mutationFn: async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      const response = await axios.post("/bids/place", { auctionId, amount });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    }
  });

  // Setup auto-bid
  const setupAutoBidMutation = useMutation({
    mutationFn: async ({ auctionId, limit }: { auctionId: string; limit: number }) => {
      const response = await axios.post("/bids/auto-setup", { auctionId, limit });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    }
  });

  return {
    placeBid: placeBidMutation.mutate,
    isPlacingBid: placeBidMutation.isPending,
    setupAutoBid: setupAutoBidMutation.mutate,
    isSettingAutoBid: setupAutoBidMutation.isPending
  };
};
