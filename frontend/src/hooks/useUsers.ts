import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

export const USER_KEYS = {
  all: (includeDeleted = false) => ['users', { includeDeleted }] as const,
};

const invalidateUsers = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
};

export const useUsers = (includeDeleted = false) => {
  return useQuery({
    queryKey: USER_KEYS.all(includeDeleted),
    queryFn: () => userApi.getAllUsers(includeDeleted),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateUserRole,
    onSuccess: () => invalidateUsers(queryClient),
  });
};

/** Blocks a user's login access (status → inactive). User stays visible. */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
};

/** Restores login access for a deactivated user (status → active). */
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.activateUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
};

/** Deletes a user — hides them from the system (status → deleted). */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
};

/** Restores a soft-deleted user (status → active). */
export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.restoreUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
};
