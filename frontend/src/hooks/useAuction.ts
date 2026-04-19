import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IAuctionFilters } from '../types/auction';
import { auctionApi } from '../api/auction.api';

export const AUCTION_KEYS = {
  all: ['auctions'] as const,
  lists: () => [...AUCTION_KEYS.all, 'list'] as const,
  list: (filters: IAuctionFilters) => [...AUCTION_KEYS.lists(), filters] as const,
  details: () => [...AUCTION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AUCTION_KEYS.details(), id] as const,
};

export const useAuctions = (filters: IAuctionFilters = {}) => {
  return useQuery({
    queryKey: AUCTION_KEYS.list(filters),
    queryFn: () => auctionApi.getAuctions(filters),
  });
};

export const useAuctionDetails = (id: string) => {
  return useQuery({
    queryKey: AUCTION_KEYS.detail(id),
    queryFn: () => auctionApi.getAuctionById(id),
    enabled: !!id,
  });
};

export const useCreateAuction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: auctionApi.createAuction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => auctionApi.updateAuction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useCancelAuction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auctionApi.cancelAuction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useAdminApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) => 
      auctionApi.adminApproveAction(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useAdminForceAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'end' }) => 
      auctionApi.adminForceAction(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useFinalizeAuction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auctionApi.finalizeAuction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: AUCTION_KEYS.lists() });
    },
  });
};

export const useMyBiddingActivity = (params: { page?: number; limit?: number; tab?: string } = {}) => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.all, 'my-activity', params],
    queryFn: () => auctionApi.getMyBiddingActivity(params),
  });
};

export const useSellerStats = () => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.all, 'seller-stats'],
    queryFn: () => auctionApi.getSellerStats(),
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.all, 'admin-stats'],
    queryFn: () => auctionApi.getAdminStats(),
  });
};

export const useAdminInventory = (filters: IAuctionFilters = {}) => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.all, 'admin-inventory', filters],
    queryFn: () => auctionApi.getAdminInventory(filters),
  });
};

export const useAuctionBids = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['bids', id],
    queryFn: () => auctionApi.getAuctionBids(id),
    enabled: !!id && enabled,
  });
};

export const useBidStatus = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['bid-status', id],
    queryFn: () => auctionApi.getBidStatus(id),
    enabled: !!id && enabled,
  });
};

export const usePublicStats = () => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.all, 'public-stats'],
    queryFn: () => auctionApi.getPublicStats(),
    refetchInterval: 60000, // Refresh every minute for the landing page
  });
};

