import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { IAuctionFilters } from '../types/auction';
import { auctionApi } from '../api/auction.api';
import { useAppMutation } from './useAppMutation';
import { MESSAGES } from '../constants/messages';

export const AUCTION_KEYS = {
  all: ['auctions'] as const,
  lists: () => [...AUCTION_KEYS.all, 'list'] as const,
  list: (filters: IAuctionFilters) => [...AUCTION_KEYS.lists(), filters] as const,
  details: () => [...AUCTION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AUCTION_KEYS.details(), id] as const,
  adminInventory: () => [...AUCTION_KEYS.all, 'admin-inventory'] as const,
  adminStats: () => [...AUCTION_KEYS.all, 'admin-stats'] as const,
  publicStats: () => [...AUCTION_KEYS.all, 'public-stats'] as const,
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
  return useAppMutation({
    mutationFn: auctionApi.createAuction,
    invalidateKeys: [AUCTION_KEYS.all],
    successMessage: MESSAGES.SUCCESS.AUCTION_CREATED,
  });
};

export const useUpdateAuction = () => {
  return useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => auctionApi.updateAuction(id, data),
    invalidateKeys: [AUCTION_KEYS.all],
  });
};

export const useCancelAuction = () => {
  return useAppMutation({
    mutationFn: (id: string) => auctionApi.cancelAuction(id),
    invalidateKeys: [AUCTION_KEYS.all],
  });
};

export const useAdminApprove = () => {
  return useAppMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) => 
      auctionApi.adminApproveAction(id, action),
    invalidateKeys: [AUCTION_KEYS.all],
  });
};

export const useAdminForceAction = () => {
  return useAppMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'end' }) => 
      auctionApi.adminForceAction(id, action),
    invalidateKeys: [AUCTION_KEYS.all],
  });
};

export const useFinalizeAuction = () => {
  return useAppMutation({
    mutationFn: (id: string) => auctionApi.finalizeAuction(id),
    invalidateKeys: [AUCTION_KEYS.all],
  });
};

export const useMyBiddingActivity = (params: { 
  page?: number; 
  limit?: number; 
  tab?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) => {
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
    queryKey: AUCTION_KEYS.adminStats(),
    queryFn: () => auctionApi.getAdminStats(),
  });
};

export const useAdminInventory = (filters: IAuctionFilters = {}) => {
  return useQuery({
    queryKey: [...AUCTION_KEYS.adminInventory(), filters],
    queryFn: () => auctionApi.getAdminInventory(filters),
  });
};

export const useAuctionBids = (id: string, params: { page?: number; limit?: number } = {}, enabled = true) => {
  return useQuery({
    queryKey: ['bids', id, params],
    queryFn: () => auctionApi.getAuctionBids(id, params),
    enabled: !!id && enabled,
  });
};

export const useInfiniteAuctionBids = (id: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['bids', id, 'infinite', { limit }],
    queryFn: ({ pageParam = 1 }) => auctionApi.getAuctionBids(id, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page && lastPage.totalPages && lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!id,
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
    queryKey: AUCTION_KEYS.publicStats(),
    queryFn: () => auctionApi.getPublicStats(),
    refetchInterval: 60000, 
  });
};


