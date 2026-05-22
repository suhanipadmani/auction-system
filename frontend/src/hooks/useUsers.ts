import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { useAppMutation } from './useAppMutation';
import { MESSAGES } from '../constants/messages';

export const USER_KEYS = {
  all: (includeDeleted = false, page = 1, limit = 20, search = "") => ['users', { includeDeleted, page, limit, search }] as const,
};

export const useUsers = (includeDeleted = false, page = 1, limit = 20, search = "") => {
  return useQuery({
    queryKey: USER_KEYS.all(includeDeleted, page, limit, search),
    queryFn: () => userApi.getAllUsers(includeDeleted, page, limit, search),
    placeholderData: keepPreviousData,
  });
};

export const useCreateUser = () => {
  return useAppMutation({
    mutationFn: userApi.createUser,
    invalidateKeys: [['users']],
    successMessage: MESSAGES.SUCCESS.USER_CREATED,
  });
};

export const useUpdateRole = () => {
  return useAppMutation({
    mutationFn: userApi.updateUserRole,
    invalidateKeys: [['users']],
    successMessage: MESSAGES.SUCCESS.USER_UPDATED,
  });
};

/** Blocks a user's login access (status → inactive). User stays visible. */
export const useDeactivateUser = () => {
  return useAppMutation({
    mutationFn: userApi.deactivateUser,
    invalidateKeys: [['users']],
  });
};

/** Restores login access for a deactivated user (status → active). */
export const useActivateUser = () => {
  return useAppMutation({
    mutationFn: userApi.activateUser,
    invalidateKeys: [['users']],
  });
};

/** Deletes a user — hides them from the system (status → deleted). */
export const useDeleteUser = () => {
  return useAppMutation({
    mutationFn: userApi.deleteUser,
    invalidateKeys: [['users']],
  });
};

/** Restores a soft-deleted user (status → active). */
export const useRestoreUser = () => {
  return useAppMutation({
    mutationFn: userApi.restoreUser,
    invalidateKeys: [['users']],
  });
};


