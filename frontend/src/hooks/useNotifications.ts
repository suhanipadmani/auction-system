import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notification.api";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
};

export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.all,
    queryFn: notificationApi.getMyNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};
